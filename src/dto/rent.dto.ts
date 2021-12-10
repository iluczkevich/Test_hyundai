import { Transform } from 'class-transformer';
import {
  IsString,
  MinLength,
  MaxLength,
  IsDateString,
  IsNumber,
  IsPositive,
  Max,
} from 'class-validator';

export class RentDto {
  @IsString()
  @MinLength(8)
  @MaxLength(9)
  licensePlate: string;

  @IsDateString()
  from: Date;

  @IsNumber()
  @IsPositive()
  @Max(30)
  @Transform(({ value }) => Number(value))
  duration: number;
}
