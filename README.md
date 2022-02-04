## Unifying business addresses

## Usage

This script simplifies the `businessAddressFinal` column in city building registration data (stored as a csv file). It does so by making abbreviations consistent (N, St, Rd, et al), as well as removing
divergences that may arise from commas, periods or white space. After the code has run, it will
make a copy of your input file with an additional `simplified_address` column at the end of each line.

## To Run the code:

Open up node index.js and change the variables `inputFilePath` and `outputFilePath`.
The former should be the name of the file (in this directory) from which you want to read;
the latter where the script will write your duplicate data.

next run `yarn` or `npm install`.

Finally, fun:

```
node index.js
```
