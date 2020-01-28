# ireal-parse [![Build Status](https://travis-ci.org/realtimerealbook/ireal-parse.svg?branch=master)](https://travis-ci.org/realtimerealbook/ireal-parse)

This is a script that selectively parses charts uploaded onto iReal Pro forums into a convenient JSON format.

![](https://github.com/realtimerealbook/ireal-parse/raw/master/docs/images/demo.gif)

A good portion of the code here is adapted from pianosnake's [ireal-reader](https://www.npmjs.com/package/ireal-reader).

## Development

As a benchmark, we aim to accurately parse all charts from the popular thread [Jazz 1300 Standards](https://www.irealb.com/forums/showthread.php?12753-Jazz-1300-Standards). A copy of the original chart data has been included in `data_in/1300_orig.txt`.

Optionally, we can configure `data_in/list.txt` to contain the list of [file names]((http://www.irealb.com/forums/showthread.php?4522-Jazz-1300-Standards-Individual-Songs)) we want to parse and test. File names should be separated by a new line, with spaces replaced by underscores, and special characters escaped:

```
Fly_Me_To_The_Moon
Got_A_Match\?
Here\'s_That_Rainy_Day
So_Nice_\(Summer_Samba\)
St\._Thomas
Tell_me_a_bedtime_story
```

Next simply run

```
node util/parse
```

Your output should now be in `data_out/<filename>.json`.
