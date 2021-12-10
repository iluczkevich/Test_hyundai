import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { ICars } from 'src/interfaces/cars.interface';
import { Client } from 'pg';
import { CarDto } from 'src/dto/car.dto';
import { RentDto } from 'src/dto/rent.dto';
import * as moment from 'moment';
import { IRent } from 'src/interfaces/rent.interface';
import { IStatistic } from 'src/interfaces/statistic.interface';

@Injectable()
export class CarsService {
  constructor(
    @Inject('DATABASE_CONNECTION')
    private readonly db: Client,
  ) {}

  async getAllCars(): Promise<ICars[]> {
    const result = await this.db.query(`SELECT * FROM cars`);
    //Need refactoring if to use not only in test task
    return result.rows.map((row) => new ICars(row));
  }

  async createCar(data: CarDto): Promise<ICars> {
    const licensePlate = data.licensePlate.toUpperCase();
    const licensePlateValid = licensePlate.match(
      /^[АВЕКМНОРСТУХ]\d{3}(?<!000)[АВЕКМНОРСТУХ]{2}\d{2,3}$/,
    );
    if (licensePlateValid) {
      try {
        await this.db
          .query(`INSERT INTO cars values ($1)`, [licensePlate.toUpperCase()])
          .then((result) => result.rows.map((row) => new ICars(row)));
        return data;
      } catch (err) {
        if (err.code === '23505')
          throw new BadRequestException('Car with this license plate exist');
        else throw err;
      }
    }
    throw new BadRequestException('Uncorrect license plate');
  }

  async deleteCar(licensePlate: string): Promise<void> {
    this.db.query(`DELETE FROM cars WHERE license_plate=$1`, [licensePlate]);
  }

  async rentCar({ licensePlate, from, duration }: RentDto): Promise<IRent> {
    try {
      const fromDate = new Date(from);
      const toDate = moment(fromDate).add(duration, 'days');
      const number = licensePlate.toUpperCase();

      if (moment(fromDate).isoWeekday() > 6 || moment(toDate).isoWeekday() > 6)
        throw new BadRequestException(
          'The start or end of the lease cannot be a weekend',
        );

      const autoNotExist = await this.db
        .query(`SELECT * FROM cars WHERE license_plate = $1`, [number])
        .then((result) => result.rowCount === 0);

      if (autoNotExist) throw new BadRequestException(`Vehicle not found`);

      const availabilityCar = await this.db
        .query(
          `SELECT * FROM cars_rent WHERE  (
            license_plate = $1 and "from" < $2 and "to" > $2
          ) or (
            license_plate = $1 and "from" < $3 and "to" > $3
          ) or (
            license_plate = $1 and "from" > $2 and "to" < $3
          )
        `,
          [number, fromDate, toDate],
        )
        .then((result) => {
          return result.rowCount === 0;
        })
        .catch((err) => {
          throw err;
        });

      if (!availabilityCar) {
        throw new BadRequestException(
          'This vehicle is not available for these dates',
        );
      }

      const price =
        duration <= 4
          ? duration * 1000
          : duration <= 9
          ? (duration - 4) * 950 + 4000
          : duration <= 17
          ? (duration - 9) * 900 + 8750
          : duration <= 30
          ? (duration - 17) * 850 + 15950
          : 0;

      const carsBlockedFrom = moment(fromDate).add(-3, 'days');
      const carsBlockedTo = moment(toDate).add(3, 'days');

      await this.db.query(
        `
        INSERT INTO cars_rent("from", "to", "license_plate")
          values ($1, $2, $3)
      `,
        [carsBlockedFrom, carsBlockedTo, number],
      );

      return {
        licensePlate: number,
        fromDate,
        toDate: toDate.toDate(),
        duration,
        price,
        carsBlockedFrom: carsBlockedFrom.toDate(),
        carsBlockedTo: carsBlockedTo.toDate(),
      };
    } catch (err) {
      throw err;
    }
  }

  async getStatic({
    id,
    date,
  }: {
    id?: string;
    date?: Date;
  }): Promise<IStatistic[]> {
    const now = date
      ? moment(new Date(date).setHours(0, 0, 0, 0))
          .add(moment().utcOffset(), 'minutes')
          .toDate()
      : moment(new Date().setHours(0, 0, 0, 0))
          .add(moment().utcOffset(), 'minutes')
          .toDate();
    const monthAgo = moment(now).add(-30, 'days').toDate();

    if (id) {
      return [await this.getWorkload(id.toUpperCase(), now, monthAgo)];
    } else {
      const cars = await this.getAllCars();
      const result = await Promise.all(
        cars.map(
          async (car) =>
            await this.getWorkload(car.licensePlate, now, monthAgo),
        ),
      );
      return result;
    }
  }

  private async getWorkload(
    licensePlate: string,
    now: Date,
    monthAgo: Date,
  ): Promise<IStatistic> {
    //take an interval intersecting from the left
    const [leftValue] = await this.db
      .query(
        `
        SELECT * FROM cars_rent WHERE
          license_plate = $1
          AND "to" > $2
          AND "from" < $2
      `,
        [licensePlate, monthAgo],
      )
      .then((result) => result.rows);
    //take an interval intersecting from the right
    const [rightValue] = await this.db
      .query(
        `
        SELECT * FROM cars_rent WHERE
          license_plate = $1
          and "from" < $2 and "to" > $2
      `,
        [licensePlate, now],
      )
      .then((result) => result.rows);
    const middleValue = await this.db
      .query(
        `
        SELECT * FROM cars_rent WHERE
          license_plate = $1
          and "from" >= $2 and "to" <= $3
          order by "from" ASC
      `,
        [licensePlate, monthAgo, now],
      )
      .then((result) => result.rows);

    let counter = 0;
    if (leftValue)
      counter += Math.ceil(moment(leftValue.to).diff(monthAgo, 'hours') / 24);

    //check for intersection with each left element
    //start from left value
    if (middleValue.length > 0) {
      if (counter !== 0) middleValue[0].from = leftValue.to;

      middleValue.forEach((x, i) => {
        if (i > 0 && x.from < middleValue[i - 1].to)
          x.from = middleValue[i - 1].to;

        counter += moment(x.to).diff(x.from, 'days');
      });
    }

    //check for intersection with last middle element
    if (rightValue) {
      if (
        middleValue.length > 0 &&
        middleValue[middleValue.length - 1].to > rightValue.from
      )
        rightValue.from = middleValue[middleValue.length - 1].to;

      counter += moment(now).diff(rightValue.from, 'days');
    }

    return {
      licensePlate,
      workload: Number(((counter / 30) * 100).toFixed(2)),
    };
  }
}
