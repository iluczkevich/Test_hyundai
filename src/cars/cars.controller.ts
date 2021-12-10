import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { CarDto } from 'src/dto/car.dto';
import { RentDto } from 'src/dto/rent.dto';
import { ICars } from 'src/interfaces/cars.interface';
import { IRent } from 'src/interfaces/rent.interface';
import { IStatistic } from 'src/interfaces/statistic.interface';
import { CarsService } from './cars.service';

@Controller('cars')
export class CarsController {
  constructor(private readonly carsService: CarsService) {}

  @Get()
  async getAllCars(): Promise<ICars[]> {
    return this.carsService.getAllCars();
  }

  @Post()
  async addNewCars(@Body() newCar: CarDto): Promise<ICars> {
    return this.carsService.createCar(newCar);
  }

  @Delete()
  async deleteCar(@Query('license_plate') licensePlate: string): Promise<void> {
    return this.carsService.deleteCar(licensePlate);
  }

  @Get('/rent')
  async rentCar(@Query() query: RentDto): Promise<IRent> {
    return this.carsService.rentCar(query);
  }

  @Get('/statistic/:id')
  async getStatisticByCar(
    @Param('id') id: string,
    @Query('date') date: Date,
  ): Promise<IStatistic[]> {
    return this.carsService.getStatic({ id, date });
  }

  @Get('/statistic')
  async getStatistic(@Query('date') date: Date): Promise<IStatistic[]> {
    return this.carsService.getStatic({ date });
  }
}
