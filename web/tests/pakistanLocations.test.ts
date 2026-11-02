import { describe, it, expect } from "vitest";
import {
  PAKISTAN_PROVINCES,
  PAKISTAN_DISTRICTS_DATA,
  PAKISTAN_CITIES,
  searchPakistanCities,
  getTehsilsForDistrict,
  findCity,
  getDistricts,
} from "@/lib/pakistanLocations";

describe("pakistanLocations", () => {
  it("includes all 7 administrative provinces/territories", () => {
    expect(PAKISTAN_PROVINCES).toHaveLength(7);
    expect(PAKISTAN_PROVINCES).toContain("Punjab");
    expect(PAKISTAN_PROVINCES).toContain("Sindh");
    expect(PAKISTAN_PROVINCES).toContain("Khyber Pakhtunkhwa");
    expect(PAKISTAN_PROVINCES).toContain("Balochistan");
    expect(PAKISTAN_PROVINCES).toContain("Islamabad Capital Territory");
    expect(PAKISTAN_PROVINCES).toContain("Azad Jammu & Kashmir");
    expect(PAKISTAN_PROVINCES).toContain("Gilgit-Baltistan");
  });

  it("covers all Pakistan districts across provinces", () => {
    expect(PAKISTAN_DISTRICTS_DATA.length).toBeGreaterThan(150);

    const punjabDistricts = getDistricts("Punjab");
    expect(punjabDistricts.length).toBeGreaterThanOrEqual(40);

    const sindhDistricts = getDistricts("Sindh");
    expect(sindhDistricts.length).toBeGreaterThanOrEqual(29);

    const kpkDistricts = getDistricts("Khyber Pakhtunkhwa");
    expect(kpkDistricts.length).toBeGreaterThanOrEqual(35);

    const balochistanDistricts = getDistricts("Balochistan");
    expect(balochistanDistricts.length).toBeGreaterThanOrEqual(35);
  });

  it("returns tehsils for specified district", () => {
    const rawalpindiTehsils = getTehsilsForDistrict("Rawalpindi");
    expect(rawalpindiTehsils).toContain("Rawalpindi");
    expect(rawalpindiTehsils).toContain("Gujar Khan");
    expect(rawalpindiTehsils).toContain("Taxila");

    const lahoreTehsils = getTehsilsForDistrict("Lahore");
    expect(lahoreTehsils).toContain("City Lahore");
    expect(lahoreTehsils).toContain("Model Town");

    const peshawarTehsils = getTehsilsForDistrict("Peshawar");
    expect(peshawarTehsils).toContain("Peshawar City");
  });

  it("searches cities by query accurately", () => {
    const resultsRawal = searchPakistanCities("rawal");
    expect(resultsRawal.some((c) => c.name.toLowerCase().includes("rawalpindi"))).toBe(true);

    const resultsLaho = searchPakistanCities("laho");
    expect(resultsLaho.some((c) => c.name.toLowerCase() === "lahore")).toBe(true);

    const resultsKarachi = searchPakistanCities("karachi");
    expect(resultsKarachi.some((c) => c.name.toLowerCase() === "karachi")).toBe(true);
  });

  it("finds city by exact name case-insensitively", () => {
    const city = findCity("ISLAMABAD");
    expect(city).toBeDefined();
    expect(city?.district).toBe("Islamabad");
    expect(city?.province).toBe("Islamabad Capital Territory");
  });
});
