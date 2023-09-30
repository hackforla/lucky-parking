import { formatDecimals } from "./formatDecimals";

export enum TYPE {
  FEET = "feet",
  KILOMETER = "kilometer",
  METER = "meter",
  MILES = "miles",
}

export type Units = "feet" | "kilometer" | "meter" | "miles";

export class UnitConvertor {
  private context: Strategy;

  constructor(type: Units) {
    switch (type) {
      case TYPE.FEET:
        this.context = new FeetConvertor();
        break;

      case TYPE.KILOMETER:
        this.context = new KilometerConvertor();
        break;

      case TYPE.MILES:
        this.context = new MilesConvertor();
        break;

      case TYPE.METER:
        this.context = new MetersConvertor();
        break;

      default:
        throw new Error("Source must NOT be empty!");
    }
  }

  public transformTo(target: Units, value: number): number {
    if (!this.context?.[target]) {
      throw new Error("method param must be initialized");
    }
    //Object[method](param)
    const res = this.context[target]?.(value) || 1;
    return formatDecimals(res);
  }
}

interface Strategy {
  feet?(units: number): number;
  kilometer?(units: number): number;
  meter?(units: number): number;
  miles?(units: number): number;
}

class MilesConvertor implements Strategy {
  public feet(units: number) {
    return units * 5280;
  }

  public kilometer(units: number) {
    return units * 1.6;
  }

  public meter(units: number) {
    return units * 1609.3;
  }
}

class FeetConvertor implements Strategy {
  public kilometer(units: number) {
    return units * 0.0003048;
  }

  public meter(units: number) {
    return units * 0.3048;
  }

  public miles(units: number) {
    return units * 0.000189394;
  }
}

class KilometerConvertor implements Strategy {
  public feet(units: number) {
    return units * 3280.84;
  }

  public meter(units: number) {
    return units * 1000;
  }

  public miles(units: number) {
    return units * 0.621371;
  }
}

class MetersConvertor implements Strategy {
  public feet(units: number) {
    return units * 3.28084;
  }

  public kilometer(units: number) {
    return units * 0.001;
  }

  public miles(units: number) {
    return units * 0.000621371;
  }
}
