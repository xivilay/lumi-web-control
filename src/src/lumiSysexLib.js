// some of these functions were taken from https://github.com/benob/LUMI-lights/blob/master/lumi_sysex.js

const checksum = (values) => {
    let sum = values.length;
    for (let i = 0; i < values.length; i++) {
        sum = (sum * 3 + values[i]) & 0xff;
    }
    return sum & 0x7f;
}

function BitArray() {
    this.values = [];
    this.num_bits = 0;
    this.append = function (value, size = 7) {
        let used_bits = parseInt(this.num_bits % 7);
        let packed = 0;
        if (used_bits > 0) {
            packed = this.values[this.values.length - 1];
            this.values.pop();
        }
        this.num_bits += size;
        while (size > 0) {
            packed |= (value << used_bits) & 127;
            size -= (7 - used_bits);
            value >>= (7 - used_bits);
            this.values.push(packed);
            packed = 0;
            used_bits = 0;
        }
    }
    this.get = function () {
        while (this.values.length < 8) this.values.push(0);
        return this.values;
    }
}

const getColor = (value) => {
    const [id, webColor] = value;
    const parsedColor = parseInt(webColor.replace('#', ''), 16);
    const red = (parsedColor & 0xff0000) >> 16;
    const green = (parsedColor & 0xff00) >> 8;
    const blue = parsedColor & 0xff;
    const bits = new BitArray();
    bits.append(0x10, 7);
    bits.append(0x20 + 0x10 * (id & 1), 7);
    bits.append(0b00100, 5);
    bits.append(parseInt(blue) & 0xff, 8);
    bits.append(parseInt(green) & 0xff, 8);
    bits.append(parseInt(red) & 0xff, 8);
    bits.append(0b11111111, 8);
    return bits.get();
}

const getBrightness = (value) => {
    const bits = new BitArray();
    bits.append(0x10, 7);
    bits.append(0x40, 7);
    bits.append(0b00100, 5);
    bits.append(value, 7);
    return bits.get();
}

const getChannel = (value) => {
    const bits = new BitArray();
    bits.append(0x10, 7);
    bits.append(0x00, 7);
    bits.append(0b00000, 5);
    bits.append(value, 32);
    return bits.get();
}

const getOctave = (value) => {
    const bits = new BitArray();
    bits.append(0x10, 7);
    bits.append(0x40, 7);
    bits.append(0b00000, 5);
    bits.append(value, 32);
    return bits.get();
}

const getTranspose = (value) => {
    const bits = new BitArray();
    bits.append(0x10, 7);
    bits.append(0x50, 7);
    bits.append(0b00000, 5);
    bits.append(value, 32);
    return bits.get();
}

const getStrikeSensitivity = (value) => {
    const bits = new BitArray();
    bits.append(0x10, 7);
    bits.append(0x20, 7);
    bits.append(0b00001, 5);
    bits.append(value, 7);
    return bits.get();
}

const getSensitivity = (value) => {
    const bits = new BitArray();
    bits.append(0x10, 7);
    bits.append(0x50, 7);
    bits.append(0b00001, 5);
    bits.append(value, 7);
    return bits.get();
}

const getFixedVelocity = (value) => {
    const bits = new BitArray();
    bits.append(0x10, 7);
    bits.append(0x70, 7);
    bits.append(0b00001, 5);
    bits.append(value ? 1 : 0, 1);
    return bits.get();
}

const getFixedVelocityValue = (value) => {
    const bits = new BitArray();
    bits.append(0x10, 7);
    bits.append(0x00, 7);
    bits.append(0b00010, 5);
    bits.append(value, 7);
    return bits.get();
}

const getColorMode = (value) => {
    const bits = new BitArray();
    bits.append(0x10, 7);
    bits.append(0x40, 7);
    bits.append(0b00010, 5);
    bits.append(parseInt(value) & 3, 2);
    return bits.get();
}

const scales = {
    'Major':                [0x02, 0x00],
    'Minor':                [0x22, 0x00],
    'Harmonic Minor':       [0x42, 0x00],
    'Pentatonic Neutral':   [0x62, 0x00],
    'Pentatonic Major':     [0x02, 0x01],
    'Pentatonic Minor':     [0x22, 0x01],
    'Blues':                [0x42, 0x01],
    'Dorian':               [0x62, 0x01],
    'Phrygian':             [0x02, 0x02],
    'Lydian':               [0x22, 0x02],
    'Mixolydian':           [0x42, 0x02],
    'Locrian':              [0x62, 0x02],
    'Whole Tone':           [0x02, 0x03],
    'Arabic (a)':           [0x22, 0x03],
    'Arabic (b)':           [0x42, 0x03],
    'Japanese':             [0x62, 0x03],
    'Ryukyu':               [0x02, 0x04],
    '8-tone Spanish':       [0x22, 0x04],
    'Chromatic':            [0x42, 0x04],
};

const getScale = (value) => [0x10, 0x60, ...scales[value], 0x00, 0x00, 0x00, 0x00];

const keys = {
    'C':  [0x03, 0x00],
    'C#': [0x23, 0x00],
    'D':  [0x43, 0x00],
    'D#': [0x63, 0x00],
    'E':  [0x03, 0x01],
    'F':  [0x23, 0x01],
    'F#': [0x43, 0x01],
    'G':  [0x63, 0x01],
    'G#': [0x03, 0x02],
    'A':  [0x23, 0x02],
    'A#': [0x43, 0x02],
    'B':  [0x63, 0x02],
};

const getKey = (value) => [0x10, 0x30, ...keys[value], 0x00, 0x00, 0x00, 0x00];

const getPressureTrackingMode = (value) => {
    const values = {
        '0': [0x10, 0x00, 0x04, 0x00, 0x00, 0x00, 0x00, 0x00], // poly aftertouch
        '1': [0x10, 0x00, 0x24, 0x00, 0x00, 0x00, 0x00, 0x00], // channel pressure
    };
    return values[value];
}

export const topologyIndexAll = 0x00;

export const scalesTypes = Object.keys(scales);
export const keysTypes = Object.keys(keys);

export const getRoliHeader = () =>   [0x00, 0x21, 0x10];
export const getSerialFooter = () => [0x78, 0x3f];
export const getTopologyFooter = () =>  [0x77, 0x00, 0x01, 0x01, 0x00, 0x5D];
export const getBlockFooter = (topologyIndex, values) => [0x77, topologyIndex, ...values, checksum(values)];

const blockControlMethods = {
    color: getColor,
    colorMode: getColorMode,
    root: getKey,
    scale: getScale,
    brightness: getBrightness,
    channel: getChannel,
    octave: getOctave,
    transpose: getTranspose,
    fixedVelocityEnabled: getFixedVelocity,
    fixedVelocity: getFixedVelocityValue,
    pressureTracking: getPressureTrackingMode,
    sensitivity: getSensitivity,
    strikeSensitivity: getStrikeSensitivity

}

export default blockControlMethods;