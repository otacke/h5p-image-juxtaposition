# H5P Image Juxtaposition
Put two images side by side with a slideable overlay effect, e.g. to create an interactive before/after image.

This content type is based on [Juxtapose](https://github.com/NUKnightLab/juxtapose) that was created by Alex Duner and Northwestern University Knight Lab, but was heavily modified. It is licensed under the [Mozilla Public License 2.0](http://mozilla.org/MPL/2.0/).

## Example
!["Image Juxtaposition for H5P"](https://ibin.co/w800/3sUVNvkmM7N8.png 'Image Juxtaposition for H5P')

## Building the distribution files
Pull or download this archive files and go into the main folder. There run

```bash
npm install
```

to get the required modules. Then build the project using

```bash
npm run build
```

or

```bash
npm run watch
```

if you want to modify the code and want to get a fresh build built in the background.

## About this repository
If you want to download the sourcecode, you can choose from three main branches:

- __release:__ Will contain the latest official release.
- __stable:__ Will contain features that have not yet been released, but that should work. Use at your own risk in a production environment.
- __master:__ Will contain the latest progress, but may not have been fully tested. Should definitely not be used in a production environment!
