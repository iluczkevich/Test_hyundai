export class ICars {
  constructor({ license_plate }: { id: number; license_plate: string }) {
    this.licensePlate = license_plate;
  }
  licensePlate: string;
}
