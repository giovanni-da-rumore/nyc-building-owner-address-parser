const fs = require("fs");

const csv = require("csv-parser");
const { group } = require("console");
const { parse } = require("path");

// the name of the files from which you'll read and to which you'll write
const inputFilePath = "building_owner_reg_long.csv";
const outputFilePath = "tableWithGroupId.csv";

const charRegExp = /[a-zA-Z]/g;

function makeNewTableWithGroupId() {
  let i = 0;
  const groupDict = {};
  const seenData = {};
  const parsedAddresses = [];

  fs.createReadStream(inputFilePath)
    .pipe(csv())
    .on("data", function (data) {
      try {
        i++;
        parsedAddresses.push(simplifyAddress(data.businessAddressFinal));
        if (i === 10) {
          console.log(parsedAddresses);
        }

        // const { businessAddressFinal, contactName } = data;
        // if (seenData[businessAddressFinal]) {
        //   groupDict[i] = seenData[businessAddressFinal];
        // } else if (seenData[contactName]) {
        //   // if (contactName === "STEVEN HIRSCH") {
        //   //   console.log("idx:", i);
        //   //   console.log("group id:", seenData[contactName]);
        //   // }
        //   groupDict[i] = seenData[contactName];
        // } else {
        //   // const uuid = makeUUID();
        //   groupDict[i] = i;

        //   if (charRegExp.test(businessAddressFinal)) {
        //     // seenData[businessAddressFinal] = uuid;
        //     seenData[businessAddressFinal] = i;
        //   }

        //   if (charRegExp.test(contactName)) {
        //     // seenData[contactName] = uuid;
        //     seenData[contactName] = i;
        //   }
        // }

        // if (i === 10) {
        //   console.log(groupDict);
        //   console.log(seenData);
        // }
      } catch (err) {
        console.log("error", err);
      }
    })
    .on("end", function () {
      // writeJoinTableCSV(groupDict);
      // writeDuplicateTable(groupDict);
      writeDuplicateTableWithAddresses(parsedAddresses);
    });
}

function writeDuplicateTable(groupDict) {
  const originalFile = fs.readFileSync(inputFilePath, "utf-8");
  var originalLines = originalFile.split(/\r\n|\n/);
  const outputFile = fs.createWriteStream(outputFilePath);
  originalLines.forEach((line, idx) => {
    if (idx === 0) {
      outputFile.write(line + ", groupId" + "\r\n");
      return;
    }
    outputFile.write(line + `, ${groupDict[idx]}` + "\r\n");
  });
  outputFile.end();
}

function writeDuplicateTableWithAddresses(simplifiedAddresses) {
  const originalFile = fs.readFileSync(inputFilePath, "utf-8");
  var originalLines = originalFile.split(/\r\n|\n/);
  const outputFile = fs.createWriteStream("simplified_address_table.csv");
  originalLines.forEach((line, idx) => {
    if (idx === 0) {
      outputFile.write(line + ", simplified_address" + "\r\n");
      return;
    }
    outputFile.write(line + `, ${simplifiedAddresses[idx - 1]}` + "\r\n");
  });
  outputFile.end();
}

// INSTRUCTIONS
// run the following command to make a duplicate csv file with a group id at the end
// To change your file name,

makeNewTableWithGroupId();

//
//
//
//
//
// old code and Instructions
// INSTRUCTIONS
// First run the following command to make your join table
// makeJoinTable();

// Then, comment out the above line and run this command to make a duplicate of the original
// csv file with newly-added groupId's

// makeNewTableFromJoin();

function writeJoinTableCSV(data, fileName = "joinedTable") {
  // const header = ["rowIndex", "JoinId"];
  const header = ["JoinId"];
  const outputFile = fs.createWriteStream(`${fileName}.csv`);
  outputFile.on("error", function (err) {
    console.log("writing error", err);
  });
  outputFile.write(header.join(", ") + "\r\n");
  Object.keys(data).forEach((key) => {
    // outputFile.write(`${key},${data[key]}` + "\r\n");
    outputFile.write(`${data[key]}` + "\r\n");
  });
  outputFile.end();
}

function makeNewTableFromJoin() {
  const joinFile = fs.readFileSync(`joinedTable.csv`, "utf-8");
  const originalFile = fs.readFileSync(inputFilePath, "utf-8");
  var joinLines = joinFile.split(/\r\n|\n/);
  var originalLines = originalFile.split(/\r\n|\n/);

  const outputFile = fs.createWriteStream(`oldTableWithGroupId.csv`);

  originalLines.forEach((line, idx) => {
    if (idx === 0) {
      outputFile.write(line + ", groupId" + "\r\n");
      return;
    }
    outputFile.write(line + `, ${joinLines[idx]}` + "\r\n");
  });
  outputFile.end();
}

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
  return finalAddress.split(" ").join("");
}

// var a = "400 WEST 119TH STREET, NEW YORK, NY 10027";
// var b = "400 W 119TH ST, NEW YORK, NY 10027";
// var c = "52 WEST69TH STREET, 2A, NEW YORK, NY 10023";

// console.log(simplifyAddress(a));
// console.log(simplifyAddress(b));
// console.log(simplifyAddress(a) === simplifyAddress(b));
// console.log(simplifyAddress(c));
