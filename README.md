# ireal-parse

This is a script that parses [charts from ireal pro](http://www.irealb.com/forums/) into a convenient JSON format, with the intention of inserting them into the rtrb database.

Most of the code here is adapted from pianosnake's [ireal-reader](https://www.npmjs.com/package/ireal-reader).

## Usage

Ensure that your file is in `data_in/<filename>.txt`. Then run
```
node parse <filename>
```

To test, ensure that the correctly parsed file is in `data_out_test/<filename>.json`. Then run
```
(node parse 1300)
node test
```
