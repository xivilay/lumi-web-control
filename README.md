# About

This project is based on the [fork](https://github.com/benoitjadinon/LUMI-lights) of [LUMI-lights](https://github.com/benob/LUMI-lights) project.

It allows you to make configuration changes of your LUMI via browser.

[**DEMO**](https://xivilay.github.io/lumi-web-control/dist/)

# Notes

There are three ways to control LUMI keyboard:

## 1) LUMI factory midi SYSEX messages

Some of them were reverse-engineered by [benob](https://github.com/benob) and thanks to that now it is possible to control it by any source capable of sending sysex (even browser)

A part of `sysex` API is described [here](https://github.com/benob/LUMI-lights/blob/master/SYSEX.txt)

The rest could be found in source code of [Roli Blocks api](https://github.com/WeAreROLI/roli_blocks_basics/tree/main/protocol)

## 2) LittleFoot language

Littlefoot language was created by `Roli` and it allows to create function that will be executed right on the keyboard.

`*.littlefoot` files can be uploaded in `Roli Dashboard` by drag-and-drop to keyboard image in the app. ALternative way of editing and uploading littlefoot scripts is to use Roli `BLOCKSCode` editor. ([Win](https://assets.roli.com/blocks/BLOCKS+Code/0.2.3/BLOCKS_Code_Installer_v0.2.3.exe) & [Mac](https://assets.roli.com/blocks/BLOCKS+Code/0.2.3/BLOCKSCodeInstallerOSX_v0.2.3.mpkg) links)

You can allways roll back any changes to the device by doing *`Factory Reset`* in `Dashboard` app.

### Examples

There are some good LUMI specific examples [here](https://github.com/benob/LUMI-lights/tree/master/littlefoot). And there are more generic examples [here](https://github.com/WeAreROLI/roli_blocks_basics/tree/main/littlefoot/scripts), [here](https://github.com/WeAreROLI/Littlefoot-Examples) and [here](https://github.com/agraef/myblocks/tree/master/examples).

### Documentation

[Read Me](https://github.com/WeAreROLI/roli_blocks_basics/blob/main/littlefoot/LittleFoot%20Language%20README.txt)
    
[The LittleFoot Language](https://weareroli.github.io/BLOCKS-SDK/the_littlefoot_language.html)

[LittleFoot Functions](https://weareroli.github.io/BLOCKS-SDK/group__LittleFootFunctions.html)

[More functions](https://github.com/WeAreROLI/roli_blocks_basics/blob/main/roli_LittleFootFunctions.dox)


## 3) C++ BLOCKS Api based on [JUCE framework](https://github.com/juce-framework/JUCE)

[BLOCKS SDK](https://github.com/WeAreROLI/BLOCKS-SDK)

[blocks_basics ~~JUCE~~ Roli module](https://github.com/WeAreROLI/roli_blocks_basics)
