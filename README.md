# basic-realtime-multipler

The best project ever.

## Getting Started
### On the server
Install the module with: `npm install basic-realtime-multipler`

```javascript
var basic_realtime_multipler = require('basic-realtime-multipler');
basic_realtime_multipler.awesome(); // "awesome"
```

### In the browser
Download the [production version][min] or the [development version][max].

[min]: https://raw.github.com/petergledhill/basic-realtime-multipler/master/dist/basic-realtime-multipler.min.js
[max]: https://raw.github.com/petergledhill/basic-realtime-multipler/master/dist/basic-realtime-multipler.js

In your web page:

```html
<script src="dist/basic-realtime-multipler.min.js"></script>
<script>
awesome(); // "awesome"
</script>
```

In your code, you can attach basic-realtime-multipler's methods to any object.

```html
<script>
var exports = Bocoup.utils;
</script>
<script src="dist/basic-realtime-multipler.min.js"></script>
<script>
Bocoup.utils.awesome(); // "awesome"
</script>
```

## Documentation
_(Coming soon)_

## Examples
_(Coming soon)_

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

_Also, please don't edit files in the "dist" subdirectory as they are generated via Grunt. You'll find source code in the "lib" subdirectory!_

## Release History
_(Nothing yet)_

## License
Copyright (c) 2013 Peter Gledhill  
Licensed under the MIT license.
