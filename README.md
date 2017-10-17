# ireal-parse

This is a script that parses [charts from ireal pro](http://www.irealb.com/forums/) into a convenient JSON format, with the intention of inserting them into the rtrb database.

Most of the code here is adapted from pianosnake's [ireal-reader](https://www.npmjs.com/package/ireal-reader).

## Usage

We use regex matching to parse files from `1300.txt`. Ensure that `data_in/1300.txt` is available, then run

```js
node parse <chart_title_with_spaces_delimited_by_underscores>
```

For example,
```js
node parse Fly_Me_To_The_Moon // parses /Fly_Me_To_The_Moon/
```

To parse everything, simply run
```js
node parse // parses /(?:)/
```

Your output should now be in `data_out/<title>.json`.

## Testing

To test that your output matches the expected output, configure `test_list.txt` to include the names of files you want to test (separated by line), ensure that the correctly parsed file is in `data_out_test/<filename>.json`. Then run

```js
node test
```
