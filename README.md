# ireal-parse

This is a script that parses [charts from ireal pro](http://www.irealb.com/forums/) into a convenient JSON format, with the intention of inserting them into the rtrb database.

A good portion of the code here is adapted from pianosnake's [ireal-reader](https://www.npmjs.com/package/ireal-reader).

## Usage

First configure `list.txt` to contain the list of files we want to parse and test. Each file is separated by a new line, with spaces replaced by underscores. For example
```
9.20_Special
26-2
52nd_Street_Theme
Fly_Me_To_The_Moon
Tell_me_a_bedtime_story
```

Ensure that `data_in/1300.txt` is available, then simply run
```js
node parse
```

Your output should now be in `data_out/<title>.json`.

## Testing

To test that your output matches the expected output, configure `list.txt` to include the names of files you want to test (separated by line), ensure that the correctly parsed file is in `data_out_test/<filename>.json`. Then run
```js
node test
```
