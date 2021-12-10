import { IsString, MaxLength, MinLength } from 'class-validator';

export class CarDto {
  @IsString()
  @MinLength(8)
  @MaxLength(9)
  licensePlate: string;
}
