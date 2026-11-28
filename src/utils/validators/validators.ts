import { RESTAURANT_TYPES } from "./constants";

export interface ValidationResult {
  valid: boolean;
  message: string;
}

export class Validators {
  private static result(valid: boolean, message: string): ValidationResult {
    return { valid, message };
  }

  // Required field
  static required(value: unknown): ValidationResult {
    const valid =
      value !== null && value !== undefined && String(value).trim().length > 0;

    return this.result(valid, valid ? "" : "This field is required.");
  }

  // Indian mobile number
  static indianPhone(value: string): ValidationResult {
    const phone = value?.trim().replace(/[\s-]/g, "");

    const valid = /^[6-9]\d{9}$/.test(phone);

    return this.result(
      valid,
      valid ? "" : "Enter a valid 10-digit Indian mobile number.",
    );
  }

  // Email
  static email(value: string): ValidationResult {
    const email = value?.trim();

    const valid =
      /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?)+$/.test(
        email,
      );

    return this.result(valid, valid ? "" : "Enter a valid email address.");
  }

  // GSTIN
  static gstin(value: string): ValidationResult {
    const gstin = value?.trim().toUpperCase();

    const valid = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/.test(
      gstin,
    );

    return this.result(valid, valid ? "" : "Enter a valid 15-character GSTIN.");
  }

  // FSSAI License Number
  static fssai(value: string): ValidationResult {
    const fssai = value?.trim();

    const valid = /^\d{14}$/.test(fssai);

    return this.result(
      valid,
      valid ? "" : "FSSAI number must contain exactly 14 digits.",
    );
  }

  // Indian PIN code
  static pincode(value: string): ValidationResult {
    const pin = value?.trim();

    const valid = /^[1-9][0-9]{5}$/.test(pin);

    return this.result(
      valid,
      valid ? "" : "Enter a valid 6-digit Indian PIN code.",
    );
  }

  // Restaurant name
  static restaurantName(value: string): ValidationResult {
    const name = value?.trim();

    const valid =
      !!name &&
      name.length >= 2 &&
      name.length <= 100 &&
      /^[a-zA-Z0-9\s&'.,()-]+$/.test(name);

    return this.result(
      valid,
      valid ? "" : "Enter a valid restaurant name (2-100 characters).",
    );
  }

  // Restaurant type
  static restaurantType(value: string): ValidationResult {
    const valid = (RESTAURANT_TYPES as readonly string[]).includes(
      value?.trim(),
    );

    return this.result(valid, valid ? "" : "Select a valid restaurant type.");
  }

  // Password
  static password(value: string): ValidationResult {
    const valid =
      typeof value === "string" &&
      value.length >= 8 &&
      /[A-Z]/.test(value) &&
      /[a-z]/.test(value) &&
      /\d/.test(value);

    return this.result(
      valid,
      valid
        ? ""
        : "Password must contain 8 characters, uppercase, lowercase and a number.",
    );
  }

  // Confirm password
  static confirmPassword(
    password: string,
    confirmPassword: string,
  ): ValidationResult {
    const valid = password === confirmPassword;

    return this.result(valid, valid ? "" : "Passwords do not match.");
  }

  // Website URL
  static website(value: string): ValidationResult {
    try {
      const url = new URL(value.trim());

      const valid =
        ["http:", "https:"].includes(url.protocol) &&
        !!url.hostname.includes(".");

      return this.result(valid, valid ? "" : "Enter a valid website URL.");
    } catch {
      return this.result(false, "Enter a valid website URL.");
    }
  }

  // Numeric values
  static positiveNumber(value: string | number): ValidationResult {
    const valid =
      String(value).trim() !== "" &&
      Number.isFinite(Number(value)) &&
      Number(value) > 0;

    return this.result(valid, valid ? "" : "Enter a number greater than zero.");
  }
}
