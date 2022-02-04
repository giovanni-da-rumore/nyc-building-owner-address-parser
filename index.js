const fs = require("fs");
const csv = require("csv-parser");

// the name of the files from which you'll read and to which you'll write
const inputFilePath = "building_owner_reg_long.csv";
const outputFilePath = "simplified_address_table.csv";

const ABBREVIATIONS = {
  W: "WEST",
  E: "EAST",
  N: "NORTH",
  S: "SOUTH",
  ST: "STREET",
  // "ST.": "STREET",
  RD: "ROAD",
  // "RD.": "ROAD",
  DR: "DRIVE",
  // "DR.": "DRIVE",
  AVE: "AVENUE",
  AV: "AVENUE",
  // "AV.": "AVENUE",
  // "AVE.": "AVENUE",
  LN: "LANE",
  // "LN.": "LANE",
  BLVD: "BOULEVARD",
  // "BLVD.": "BOULEVARD",
  CT: "COURT",
  // "CT.": "COURT",
  FL: "FLOOR",
  F: "FLOOR",
  CTR: "CENTER",
  BKLYN: "BROOKLYN",
  BRKLYN: "BROOKLYN",
  "NEW YORK CITY": "NEW YORK",
  "NEW YORKC": "NEW YORK",
  NYC: "NEW YORK",
  // Floor typo
};

const TYPOS = {
  THFL: "TH FLOOR",
  // remove number abbreviations after standard ones, to unify things like 3rd FL and 3 F
  "1ST": "1 ",
  "2ND": "2 ",
  "3RD": "3 ",
  "4TH": "4 ",
  "5TH": "5 ",
  "6TH": "6 ",
  "7TH": "7 ",
  "8TH": "8 ",
  "9TH": "9 ",
  "0TH": "0 ",
};

function simplifyAddress(address) {
  let finalAddress = address
    .toUpperCase()
    .split(",")
    .join(" ")
    .split(".")
    .join("");

  Object.keys(ABBREVIATIONS).forEach((key) => {
    if (finalAddress.split(` ${key} `).length === 2) {
      const split = finalAddress.split(` ${key} `);
      finalAddress = `${split[0]} ${ABBREVIATIONS[key]} ${split[1]}`;
    }
  });
  Object.keys(TYPOS).forEach((key) => {
    if (finalAddress.split(`${key}`).length === 2) {
      const split = finalAddress.split(key);
      finalAddress = `${split[0]}${TYPOS[key]}${split[1]}`;
    }
  });
  return finalAddress.split(" ").join("");
}

function writeNewTable(simplifiedAddresses) {
  const originalFile = fs.readFileSync(inputFilePath, "utf-8");
  var originalLines = originalFile.split(/\r\n|\n/);
  const outputFile = fs.createWriteStream(outputFilePath);
  originalLines.forEach((line, idx) => {
    if (idx === 0) {
      outputFile.write(line + ",simplified_address" + "\r\n");
      return;
    }
    outputFile.write(line + `,${simplifiedAddresses[idx - 1]}` + "\r\n");
  });
  outputFile.end();
}

function makeNewTableWithAddresses() {
  const parsedAddresses = [];

  fs.createReadStream(inputFilePath)
    .pipe(csv())
    .on("data", function (data) {
      try {
        parsedAddresses.push(simplifyAddress(data.businessAddressFinal));
      } catch (err) {
        console.log("error", err);
      }
    })
    .on("end", function () {
      writeNewTable(parsedAddresses);
    });
}

makeNewTableWithAddresses();

// 622 THIRD AVENUE, 14TH F, NEW YORK, NY 10017
//58
// 622THIRDAVENUE14THFLOORNEWYORKNY10017

// 622 THIRD AVENUE, 14 FL, NEW YORK, NY 10017

//168
// 622THIRDAVENUE14FLOORNEWYORKNY10017
