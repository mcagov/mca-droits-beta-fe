/**
 * GeoTools javascript coordinate transformations
 * http://files.dixo.net/geotools.html
 *
 * This file copyright (c)2005 Paul Dixon (paul@elphin.com)
 *

 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 59 Temple Place - Suite 330, Boston, MA  02111-1307, USA.
 * 

 * --------------------------------------------------------------------------- 
 * 
 * Credits

 *

 * The algorithm used by the script for WGS84-OSGB36 conversions is derived 

 * from an OSGB spreadsheet (www.gps.gov.uk) with permission. This has been
 * adapted into Perl by Ian Harris, and into PHP by Barry Hunter. Conversion
 * accuracy is in the order of 7m for 90% of Great Britain, and should be 
 * be similar to the conversion made by a typical GPSr
 *

 * See accompanying documentation for more information
 * http://files.dixo.net/geotools.html
 */

/*****************************************************************************
 *
 * GT_OSGB holds OSGB grid coordinates
 *
 *****************************************************************************/

export class GT_OSGB {
  constructor() {
    this.northings = 0;
    this.eastings = 0;
    this.status = 'Undefined';
  }

  setGridCoordinates(eastings, northings) {
    this.northings = northings;
    this.eastings = eastings;
    this.status = 'OK';
  }

  setError(msg) {
    this.status = msg;
  }

  _zeropad(num, len) {
    let str = new String(num);
    while (str.length < len) {
      str = `0${str}`;
    }
    return str;
  }

  getGridRef(precision) {
    if (precision < 0) precision = 0;
    if (precision > 5) precision = 5;

    var e = '';

    var n = '';
    if (precision > 0) {
      var y = Math.floor(this.northings / 100000);
      var x = Math.floor(this.eastings / 100000);

      var e = Math.round(this.eastings % 100000);
      var n = Math.round(this.northings % 100000);

      const div = 5 - precision;
      e = Math.round(e / 10 ** div);
      n = Math.round(n / 10 ** div);
    }

    const prefix = GT_OSGB.prefixes[y][x];

    return `${prefix} ${this._zeropad(e, precision)} ${this._zeropad(
      n,
      precision
    )}`;
  }

  parseGridRef(landranger) {
    let ok = false;

    this.northings = 0;
    this.eastings = 0;

    let precision;

    for (precision = 5; precision >= 1; precision--) {
      const pattern = new RegExp(
        `^([A-Z]{2})\\s*(\\d{${precision}})\\s*(\\d{${precision}})$`,
        'i'
      );
      const gridRef = landranger.match(pattern);
      if (gridRef) {
        const gridSheet = gridRef[1];
        let gridEast = 0;
        let gridNorth = 0;

        //5x1 4x10 3x100 2x1000 1x10000
        if (precision > 0) {
          const mult = 10 ** (5 - precision);
          gridEast = parseInt(gridRef[2], 10) * mult;
          gridNorth = parseInt(gridRef[3], 10) * mult;
        }

        let x;
        let y;
        search: for (y = 0; y < GT_OSGB.prefixes.length; y++) {
          for (x = 0; x < GT_OSGB.prefixes[y].length; x++)
            if (GT_OSGB.prefixes[y][x] == gridSheet) {
              this.eastings = x * 100000 + gridEast;
              this.northings = y * 100000 + gridNorth;
              ok = true;
              break search;
            }
        }
      }
    }

    return ok;
  }

  getWGS84() {
    const height = 0;

    const lat1 = GT_Math.E_N_to_Lat(
      this.eastings,
      this.northings,
      6377563.396,
      6356256.91,
      400000,
      -100000,
      0.999601272,
      49.0,
      -2.0
    );
    const lon1 = GT_Math.E_N_to_Long(
      this.eastings,
      this.northings,
      6377563.396,
      6356256.91,
      400000,
      -100000,
      0.999601272,
      49.0,
      -2.0
    );

    const x1 = GT_Math.Lat_Long_H_to_X(
      lat1,
      lon1,
      height,
      6377563.396,
      6356256.91
    );
    const y1 = GT_Math.Lat_Long_H_to_Y(
      lat1,
      lon1,
      height,
      6377563.396,
      6356256.91
    );
    const z1 = GT_Math.Lat_H_to_Z(lat1, height, 6377563.396, 6356256.91);

    const x2 = GT_Math.Helmert_X(x1, y1, z1, 446.448, 0.247, 0.8421, -20.4894);
    const y2 = GT_Math.Helmert_Y(
      x1,
      y1,
      z1,
      -125.157,
      0.1502,
      0.8421,
      -20.4894
    );
    const z2 = GT_Math.Helmert_Z(x1, y1, z1, 542.06, 0.1502, 0.247, -20.4894);

    const latitude = GT_Math.XYZ_to_Lat(x2, y2, z2, 6378137.0, 6356752.313);
    const longitude = GT_Math.XYZ_to_Long(x2, y2);

    const wgs84 = new GT_WGS84();
    wgs84.setDegrees(latitude, longitude);
    return wgs84;
  }
}

GT_OSGB.prefixes = new Array(
  new Array('SV', 'SW', 'SX', 'SY', 'SZ', 'TV', 'TW'),
  new Array('SQ', 'SR', 'SS', 'ST', 'SU', 'TQ', 'TR'),
  new Array('SL', 'SM', 'SN', 'SO', 'SP', 'TL', 'TM'),
  new Array('SF', 'SG', 'SH', 'SJ', 'SK', 'TF', 'TG'),
  new Array('SA', 'SB', 'SC', 'SD', 'SE', 'TA', 'TB'),
  new Array('NV', 'NW', 'NX', 'NY', 'NZ', 'OV', 'OW'),
  new Array('NQ', 'NR', 'NS', 'NT', 'NU', 'OQ', 'OR'),
  new Array('NL', 'NM', 'NN', 'NO', 'NP', 'OL', 'OM'),
  new Array('NF', 'NG', 'NH', 'NJ', 'NK', 'OF', 'OG'),
  new Array('NA', 'NB', 'NC', 'ND', 'NE', 'OA', 'OB'),
  new Array('HV', 'HW', 'HX', 'HY', 'HZ', 'JV', 'JW'),
  new Array('HQ', 'HR', 'HS', 'HT', 'HU', 'JQ', 'JR'),
  new Array('HL', 'HM', 'HN', 'HO', 'HP', 'JL', 'JM')
);

/*****************************************************************************
 *
 * GT_WGS84 holds WGS84 latitude and longitude
 *
 *****************************************************************************/

class GT_WGS84 {
  constructor() {
    this.latitude = 0;
    this.longitude = 0;
  }

  setDegrees(latitude, longitude) {
    this.latitude = latitude;
    this.longitude = longitude;
  }

  parseString(text) {
    let ok = false;

    const str = new String(text);

    //N 51° 53.947 W 000° 10.018

    const pattern = /([ns])\s*(\d+)[°\s]+(\d+\.\d+)\s+([we])\s*(\d+)[°\s]+(\d+\.\d+)/i;
    const matches = str.match(pattern);
    if (matches) {
      ok = true;
      const latsign = matches[1] == 's' || matches[1] == 'S' ? -1 : 1;
      const longsign = matches[4] == 'w' || matches[4] == 'W' ? -1 : 1;

      const d1 = parseFloat(matches[2]);
      const m1 = parseFloat(matches[3]);
      const d2 = parseFloat(matches[5]);
      const m2 = parseFloat(matches[6]);

      this.latitude = latsign * (d1 + m1 / 60.0);
      this.longitude = longsign * (d2 + m2 / 60.0);
    }

    return ok;
  }

  isGreatBritain() {
    return (
      this.latitude > 49 &&
      this.latitude < 62 &&
      this.longitude > -9.5 &&
      this.longitude < 2.3
    );
  }

  isIreland() {
    return (
      this.latitude > 51.2 &&
      this.latitude < 55.73 &&
      this.longitude > -12.2 &&
      this.longitude < -4.8
    );
  }

  getOSGB() {
    const osgb = new GT_OSGB();
    if (this.isGreatBritain()) {
      const height = 0;

      const x1 = GT_Math.Lat_Long_H_to_X(
        this.latitude,
        this.longitude,
        height,
        6378137.0,
        6356752.313
      );
      const y1 = GT_Math.Lat_Long_H_to_Y(
        this.latitude,
        this.longitude,
        height,
        6378137.0,
        6356752.313
      );
      const z1 = GT_Math.Lat_H_to_Z(
        this.latitude,
        height,
        6378137.0,
        6356752.313
      );

      const x2 = GT_Math.Helmert_X(
        x1,
        y1,
        z1,
        -446.448,
        -0.247,
        -0.8421,
        20.4894
      );
      const y2 = GT_Math.Helmert_Y(
        x1,
        y1,
        z1,
        125.157,
        -0.1502,
        -0.8421,
        20.4894
      );
      const z2 = GT_Math.Helmert_Z(
        x1,
        y1,
        z1,
        -542.06,
        -0.1502,
        -0.247,
        20.4894
      );

      const latitude2 = GT_Math.XYZ_to_Lat(x2, y2, z2, 6377563.396, 6356256.91);
      const longitude2 = GT_Math.XYZ_to_Long(x2, y2);

      const e = GT_Math.Lat_Long_to_East(
        latitude2,
        longitude2,
        6377563.396,
        6356256.91,
        400000,
        0.999601272,
        49.0,
        -2.0
      );
      const n = GT_Math.Lat_Long_to_North(
        latitude2,
        longitude2,
        6377563.396,
        6356256.91,
        400000,
        -100000,
        0.999601272,
        49.0,
        -2.0
      );

      osgb.setGridCoordinates(Math.round(e), Math.round(n));
    } else {
      osgb.setError('Coordinate not within Great Britain');
    }

    return osgb;
  }
}

/*****************************************************************************
 *
 * GT_Math is a collection of static methods doing all the nasty sums
 *
 *****************************************************************************/

//GT_Math is just namespace for all the nasty maths functions
function GT_Math() {}

GT_Math.E_N_to_Lat = (East, North, a, b, e0, n0, f0, PHI0, LAM0) => {
  //Un-project Transverse Mercator eastings and northings back to latitude.
  //Input: - _
  //eastings (East) and northings (North) in meters; _
  //ellipsoid axis dimensions (a & b) in meters; _
  //eastings (e0) and northings (n0) of false origin in meters; _
  //central meridian scale factor (f0) and _
  //latitude (PHI0) and longitude (LAM0) of false origin in decimal degrees.

  //'REQUIRES THE "Marc" AND "InitialLat" FUNCTIONS

  //Convert angle measures to radians
  const Pi = 3.14159265358979;
  const RadPHI0 = PHI0 * (Pi / 180);
  const RadLAM0 = LAM0 * (Pi / 180);

  //Compute af0, bf0, e squared (e2), n and Et
  const af0 = a * f0;
  const bf0 = b * f0;
  const e2 = (af0 ** 2 - bf0 ** 2) / af0 ** 2;
  const n = (af0 - bf0) / (af0 + bf0);
  const Et = East - e0;

  //Compute initial value for latitude (PHI) in radians
  const PHId = GT_Math.InitialLat(North, n0, af0, RadPHI0, n, bf0);

  //Compute nu, rho and eta2 using value for PHId
  const nu = af0 / Math.sqrt(1 - e2 * Math.sin(PHId) ** 2);
  const rho = (nu * (1 - e2)) / (1 - e2 * Math.sin(PHId) ** 2);
  const eta2 = nu / rho - 1;

  //Compute Latitude
  const VII = Math.tan(PHId) / (2 * rho * nu);
  const VIII =
    (Math.tan(PHId) / (24 * rho * nu ** 3)) *
    (5 + 3 * Math.tan(PHId) ** 2 + eta2 - 9 * eta2 * Math.tan(PHId) ** 2);
  const IX =
    (Math.tan(PHId) / (720 * rho * nu ** 5)) *
    (61 + 90 * (Math.tan(PHId) ^ 2) + 45 * Math.tan(PHId) ** 4);

  const E_N_to_Lat =
    (180 / Pi) * (PHId - Et ** 2 * VII + Et ** 4 * VIII - (Et ^ 6) * IX);

  return E_N_to_Lat;
};

GT_Math.E_N_to_Long = (East, North, a, b, e0, n0, f0, PHI0, LAM0) => {
  //Un-project Transverse Mercator eastings and northings back to longitude.
  //Input: - _
  //eastings (East) and northings (North) in meters; _
  //ellipsoid axis dimensions (a & b) in meters; _
  //eastings (e0) and northings (n0) of false origin in meters; _
  //central meridian scale factor (f0) and _
  //latitude (PHI0) and longitude (LAM0) of false origin in decimal degrees.

  //REQUIRES THE "Marc" AND "InitialLat" FUNCTIONS

  //Convert angle measures to radians
  const Pi = 3.14159265358979;
  const RadPHI0 = PHI0 * (Pi / 180);
  const RadLAM0 = LAM0 * (Pi / 180);

  //Compute af0, bf0, e squared (e2), n and Et
  const af0 = a * f0;
  const bf0 = b * f0;
  const e2 = (af0 ** 2 - bf0 ** 2) / af0 ** 2;
  const n = (af0 - bf0) / (af0 + bf0);
  const Et = East - e0;

  //Compute initial value for latitude (PHI) in radians
  const PHId = GT_Math.InitialLat(North, n0, af0, RadPHI0, n, bf0);

  //Compute nu, rho and eta2 using value for PHId
  const nu = af0 / Math.sqrt(1 - e2 * Math.sin(PHId) ** 2);
  const rho = (nu * (1 - e2)) / (1 - e2 * Math.sin(PHId) ** 2);
  const eta2 = nu / rho - 1;

  //Compute Longitude
  const X = Math.cos(PHId) ** -1 / nu;
  const XI =
    (Math.cos(PHId) ** -1 / (6 * nu ** 3)) *
    (nu / rho + 2 * Math.tan(PHId) ** 2);
  const XII =
    (Math.cos(PHId) ** -1 / (120 * nu ** 5)) *
    (5 + 28 * Math.tan(PHId) ** 2 + 24 * Math.tan(PHId) ** 4);
  const XIIA =
    (Math.cos(PHId) ** -1 / (5040 * nu ** 7)) *
    (61 +
      662 * Math.tan(PHId) ** 2 +
      1320 * Math.tan(PHId) ** 4 +
      720 * Math.tan(PHId) ** 6);

  const E_N_to_Long =
    (180 / Pi) *
    (RadLAM0 + Et * X - Et ** 3 * XI + Et ** 5 * XII - Et ** 7 * XIIA);

  return E_N_to_Long;
};

GT_Math.InitialLat = (North, n0, afo, PHI0, n, bfo) => {
  //Compute initial value for Latitude (PHI) IN RADIANS.
  //Input: - _
  //northing of point (North) and northing of false origin (n0) in meters; _
  //semi major axis multiplied by central meridian scale factor (af0) in meters; _
  //latitude of false origin (PHI0) IN RADIANS; _
  //n (computed from a, b and f0) and _
  //ellipsoid semi major axis multiplied by central meridian scale factor (bf0) in meters.

  //REQUIRES THE "Marc" FUNCTION
  //THIS FUNCTION IS CALLED BY THE "E_N_to_Lat", "E_N_to_Long" and "E_N_to_C" FUNCTIONS
  //THIS FUNCTION IS ALSO USED ON IT'S OWN IN THE  "Projection and Transformation Calculations.xls" SPREADSHEET

  //First PHI value (PHI1)
  let PHI1 = (North - n0) / afo + PHI0;

  //Calculate M
  let M = GT_Math.Marc(bfo, n, PHI0, PHI1);

  //Calculate new PHI value (PHI2)
  let PHI2 = (North - n0 - M) / afo + PHI1;

  //Iterate to get final value for InitialLat
  while (Math.abs(North - n0 - M) > 0.00001) {
    PHI2 = (North - n0 - M) / afo + PHI1;
    M = GT_Math.Marc(bfo, n, PHI0, PHI2);
    PHI1 = PHI2;
  }
  return PHI2;
};

GT_Math.Lat_Long_H_to_X = (PHI, LAM, H, a, b) => {
  // Convert geodetic coords lat (PHI), long (LAM) and height (H) to cartesian X coordinate.
  // Input: - _
  //    Latitude (PHI)& Longitude (LAM) both in decimal degrees; _
  //  Ellipsoidal height (H) and ellipsoid axis dimensions (a & b) all in meters.

  // Convert angle measures to radians
  const Pi = 3.14159265358979;
  const RadPHI = PHI * (Pi / 180);
  const RadLAM = LAM * (Pi / 180);

  // Compute eccentricity squared and nu
  const e2 = (a ** 2 - b ** 2) / a ** 2;
  const V = a / Math.sqrt(1 - e2 * Math.sin(RadPHI) ** 2);

  // Compute X
  return (V + H) * Math.cos(RadPHI) * Math.cos(RadLAM);
};

GT_Math.Lat_Long_H_to_Y = (PHI, LAM, H, a, b) => {
  // Convert geodetic coords lat (PHI), long (LAM) and height (H) to cartesian Y coordinate.
  // Input: - _
  // Latitude (PHI)& Longitude (LAM) both in decimal degrees; _
  // Ellipsoidal height (H) and ellipsoid axis dimensions (a & b) all in meters.

  // Convert angle measures to radians
  const Pi = 3.14159265358979;
  const RadPHI = PHI * (Pi / 180);
  const RadLAM = LAM * (Pi / 180);

  // Compute eccentricity squared and nu
  const e2 = (a ** 2 - b ** 2) / a ** 2;
  const V = a / Math.sqrt(1 - e2 * Math.sin(RadPHI) ** 2);

  // Compute Y
  return (V + H) * Math.cos(RadPHI) * Math.sin(RadLAM);
};

GT_Math.Lat_H_to_Z = (PHI, H, a, b) => {
  // Convert geodetic coord components latitude (PHI) and height (H) to cartesian Z coordinate.
  // Input: - _
  //    Latitude (PHI) decimal degrees; _
  // Ellipsoidal height (H) and ellipsoid axis dimensions (a & b) all in meters.

  // Convert angle measures to radians
  const Pi = 3.14159265358979;
  const RadPHI = PHI * (Pi / 180);

  // Compute eccentricity squared and nu
  const e2 = (a ** 2 - b ** 2) / a ** 2;
  const V = a / Math.sqrt(1 - e2 * Math.sin(RadPHI) ** 2);

  // Compute X
  return (V * (1 - e2) + H) * Math.sin(RadPHI);
};

GT_Math.Helmert_X = (X, Y, Z, DX, Y_Rot, Z_Rot, s) => {
  // (X, Y, Z, DX, Y_Rot, Z_Rot, s)
  // Computed Helmert transformed X coordinate.
  // Input: - _
  //    cartesian XYZ coords (X,Y,Z), X translation (DX) all in meters ; _
  // Y and Z rotations in seconds of arc (Y_Rot, Z_Rot) and scale in ppm (s).

  // Convert rotations to radians and ppm scale to a factor
  const Pi = 3.14159265358979;
  const sfactor = s * 0.000001;

  const RadY_Rot = (Y_Rot / 3600) * (Pi / 180);

  const RadZ_Rot = (Z_Rot / 3600) * (Pi / 180);

  //Compute transformed X coord
  return X + X * sfactor - Y * RadZ_Rot + Z * RadY_Rot + DX;
};

GT_Math.Helmert_Y = (X, Y, Z, DY, X_Rot, Z_Rot, s) => {
  // (X, Y, Z, DY, X_Rot, Z_Rot, s)
  // Computed Helmert transformed Y coordinate.
  // Input: - _
  //    cartesian XYZ coords (X,Y,Z), Y translation (DY) all in meters ; _
  //  X and Z rotations in seconds of arc (X_Rot, Z_Rot) and scale in ppm (s).

  // Convert rotations to radians and ppm scale to a factor
  const Pi = 3.14159265358979;
  const sfactor = s * 0.000001;
  const RadX_Rot = (X_Rot / 3600) * (Pi / 180);
  const RadZ_Rot = (Z_Rot / 3600) * (Pi / 180);

  // Compute transformed Y coord
  return X * RadZ_Rot + Y + Y * sfactor - Z * RadX_Rot + DY;
};

GT_Math.Helmert_Z = (X, Y, Z, DZ, X_Rot, Y_Rot, s) => {
  // (X, Y, Z, DZ, X_Rot, Y_Rot, s)
  // Computed Helmert transformed Z coordinate.
  // Input: - _
  //    cartesian XYZ coords (X,Y,Z), Z translation (DZ) all in meters ; _
  // X and Y rotations in seconds of arc (X_Rot, Y_Rot) and scale in ppm (s).
  //
  // Convert rotations to radians and ppm scale to a factor
  const Pi = 3.14159265358979;
  const sfactor = s * 0.000001;
  const RadX_Rot = (X_Rot / 3600) * (Pi / 180);
  const RadY_Rot = (Y_Rot / 3600) * (Pi / 180);

  // Compute transformed Z coord
  return -1 * X * RadY_Rot + Y * RadX_Rot + Z + Z * sfactor + DZ;
};

GT_Math.XYZ_to_Lat = (X, Y, Z, a, b) => {
  // Convert XYZ to Latitude (PHI) in Dec Degrees.
  // Input: - _
  // XYZ cartesian coords (X,Y,Z) and ellipsoid axis dimensions (a & b), all in meters.

  // THIS FUNCTION REQUIRES THE "Iterate_XYZ_to_Lat" FUNCTION
  // THIS FUNCTION IS CALLED BY THE "XYZ_to_H" FUNCTION

  const RootXYSqr = Math.sqrt(X ** 2 + Y ** 2);
  const e2 = (a ** 2 - b ** 2) / a ** 2;
  const PHI1 = Math.atan2(Z, RootXYSqr * (1 - e2));

  const PHI = GT_Math.Iterate_XYZ_to_Lat(a, e2, PHI1, Z, RootXYSqr);

  const Pi = 3.14159265358979;

  return PHI * (180 / Pi);
};

GT_Math.Iterate_XYZ_to_Lat = (a, e2, PHI1, Z, RootXYSqr) => {
  // Iteratively computes Latitude (PHI).
  // Input: - _
  //    ellipsoid semi major axis (a) in meters; _
  //    eta squared (e2); _
  //    estimated value for latitude (PHI1) in radians; _
  //    cartesian Z coordinate (Z) in meters; _
  // RootXYSqr computed from X & Y in meters.

  // THIS FUNCTION IS CALLED BY THE "XYZ_to_PHI" FUNCTION
  // THIS FUNCTION IS ALSO USED ON IT'S OWN IN THE _
  // "Projection and Transformation Calculations.xls" SPREADSHEET

  let V = a / Math.sqrt(1 - e2 * Math.sin(PHI1) ** 2);
  let PHI2 = Math.atan2(Z + e2 * V * Math.sin(PHI1), RootXYSqr);

  while (Math.abs(PHI1 - PHI2) > 0.000000001) {
    PHI1 = PHI2;
    V = a / Math.sqrt(1 - e2 * Math.sin(PHI1) ** 2);
    PHI2 = Math.atan2(Z + e2 * V * Math.sin(PHI1), RootXYSqr);
  }

  return PHI2;
};

GT_Math.XYZ_to_Long = (X, Y) => {
  // Convert XYZ to Longitude (LAM) in Dec Degrees.
  // Input: - _
  // X and Y cartesian coords in meters.

  const Pi = 3.14159265358979;
  return Math.atan2(Y, X) * (180 / Pi);
};

GT_Math.Marc = (
  bf0,
  n,
  PHI0,
  PHI //Compute meridional arc.
) =>
  //Input: - _
  // ellipsoid semi major axis multiplied by central meridian scale factor (bf0) in meters; _
  // n (computed from a, b and f0); _
  // lat of false origin (PHI0) and initial or final latitude of point (PHI) IN RADIANS.

  //THIS FUNCTION IS CALLED BY THE - _
  // "Lat_Long_to_North" and "InitialLat" FUNCTIONS
  // THIS FUNCTION IS ALSO USED ON IT'S OWN IN THE "Projection and Transformation Calculations.xls" SPREADSHEET

  bf0 *
  ((1 + n + (5 / 4) * n ** 2 + (5 / 4) * n ** 3) * (PHI - PHI0) -
    (3 * n + 3 * n ** 2 + (21 / 8) * n ** 3) *
      Math.sin(PHI - PHI0) *
      Math.cos(PHI + PHI0) +
    ((15 / 8) * n ** 2 + (15 / 8) * n ** 3) *
      Math.sin(2 * (PHI - PHI0)) *
      Math.cos(2 * (PHI + PHI0)) -
    (35 / 24) *
      n ** 3 *
      Math.sin(3 * (PHI - PHI0)) *
      Math.cos(3 * (PHI + PHI0)));

GT_Math.Lat_Long_to_East = (PHI, LAM, a, b, e0, f0, PHI0, LAM0) => {
  //Project Latitude and longitude to Transverse Mercator eastings.
  //Input: - _
  //    Latitude (PHI) and Longitude (LAM) in decimal degrees; _
  //    ellipsoid axis dimensions (a & b) in meters; _
  //    eastings of false origin (e0) in meters; _
  //    central meridian scale factor (f0); _
  // latitude (PHI0) and longitude (LAM0) of false origin in decimal degrees.

  // Convert angle measures to radians
  const Pi = 3.14159265358979;
  const RadPHI = PHI * (Pi / 180);
  const RadLAM = LAM * (Pi / 180);
  const RadPHI0 = PHI0 * (Pi / 180);
  const RadLAM0 = LAM0 * (Pi / 180);

  const af0 = a * f0;
  const bf0 = b * f0;
  const e2 = (af0 ** 2 - bf0 ** 2) / af0 ** 2;
  const n = (af0 - bf0) / (af0 + bf0);
  const nu = af0 / Math.sqrt(1 - e2 * Math.sin(RadPHI) ** 2);
  const rho = (nu * (1 - e2)) / (1 - e2 * Math.sin(RadPHI) ** 2);
  const eta2 = nu / rho - 1;
  const p = RadLAM - RadLAM0;

  const IV = nu * Math.cos(RadPHI);
  const V =
    (nu / 6) * Math.cos(RadPHI) ** 3 * (nu / rho - Math.tan(RadPHI) ** 2);
  const VI =
    (nu / 120) *
    Math.cos(RadPHI) ** 5 *
    (5 -
      18 * Math.tan(RadPHI) ** 2 +
      Math.tan(RadPHI) ** 4 +
      14 * eta2 -
      58 * Math.tan(RadPHI) ** 2 * eta2);

  return e0 + p * IV + p ** 3 * V + p ** 5 * VI;
};

GT_Math.Lat_Long_to_North = (PHI, LAM, a, b, e0, n0, f0, PHI0, LAM0) => {
  // Project Latitude and longitude to Transverse Mercator northings
  // Input: - _
  // Latitude (PHI) and Longitude (LAM) in decimal degrees; _
  // ellipsoid axis dimensions (a & b) in meters; _
  // eastings (e0) and northings (n0) of false origin in meters; _
  // central meridian scale factor (f0); _
  // latitude (PHI0) and longitude (LAM0) of false origin in decimal degrees.

  // REQUIRES THE "Marc" FUNCTION

  // Convert angle measures to radians
  const Pi = 3.14159265358979;
  const RadPHI = PHI * (Pi / 180);
  const RadLAM = LAM * (Pi / 180);
  const RadPHI0 = PHI0 * (Pi / 180);
  const RadLAM0 = LAM0 * (Pi / 180);

  const af0 = a * f0;
  const bf0 = b * f0;
  const e2 = (af0 ** 2 - bf0 ** 2) / af0 ** 2;
  const n = (af0 - bf0) / (af0 + bf0);
  const nu = af0 / Math.sqrt(1 - e2 * Math.sin(RadPHI) ** 2);
  const rho = (nu * (1 - e2)) / (1 - e2 * Math.sin(RadPHI) ** 2);
  const eta2 = nu / rho - 1;
  const p = RadLAM - RadLAM0;
  const M = GT_Math.Marc(bf0, n, RadPHI0, RadPHI);

  const I = M + n0;
  const II = (nu / 2) * Math.sin(RadPHI) * Math.cos(RadPHI);
  const III =
    (nu / 24) *
    Math.sin(RadPHI) *
    Math.cos(RadPHI) ** 3 *
    (5 - Math.tan(RadPHI) ** 2 + 9 * eta2);
  const IIIA =
    (nu / 720) *
    Math.sin(RadPHI) *
    Math.cos(RadPHI) ** 5 *
    (61 - 58 * Math.tan(RadPHI) ** 2 + Math.tan(RadPHI) ** 4);

  return I + p ** 2 * II + p ** 4 * III + p ** 6 * IIIA;
};
