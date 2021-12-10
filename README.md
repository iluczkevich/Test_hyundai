<p align="center">
  <img src="https://nestjs.com/img/logo_text.svg" width="320" alt="Nest Logo" />
</p>

  <p align="center">Create with Nest.js</p>

## Description

Test task to Hyundai-carshering. Tables and test values for 5 cars are created when app starts.

## Get started

- Create `.env` file.
- Copy values from `.env.example`
- Set into `.env` your environment values

## Installation

```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Endpoints

### Cars

#### Get list of all vehicles

```url
GET /cars
```

Format response:

```json
[
  {
    "licensePlate": "string"
  }
]
```

#### Add to new car

```url
POST /cars
```

Body format:

```json
{
  "licensePlate": "string"
}
```

Format response:

```json
{
  "licensePlate": "string"
}
```

#### Delete car

```url
POST /cars
```

Query format:
`license_plate=string`
Format response: No response

### Work with rent

#### Get car to rent

```url
GET /cars/rent
```

Query format:`licensePlate=string&duration=number&from=date`
<br>All fields are required

Format response:

```json
{
  "licensePlate": "string",
  "fromDate": "Date",
  "toDate": "Date",
  "duration": "Number",
  "price": "Number",
  "carsBlockedFrom": "Date",
  "carsBlockedTo": "Date"
}
```

#### Get workload statistic

```url
POST /cars/statistic/:id
```

<p>
<b>ID</b> - If it does not exist, statistics are taken for all cars. If ID is <br>
specified, then statistics on the corresponding car number is taken</p>

Query format: `date=Date`

<p><b>date</b> - The date from which we count down a month ago and get statistics</p>

Format response:

```json
[
  {
    "licensePlate": "string",
    "workload": 0
  }
]
```
