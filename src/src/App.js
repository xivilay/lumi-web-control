
import { useEffect, useState, useCallback, useContext } from 'react';
import { Piano } from 'react-piano';
import { WebMidi } from "webmidi";
import { Box, CheckBox, Form, FormField, Grid, Header, Menu, Text, Page, PageContent, Button, RadioButtonGroup, RangeInput, ResponsiveContext } from 'grommet';
import { NumberInput } from 'grommet-controls';
import { topologyIndexAll, scalesTypes, keysTypes, getRoliHeader, getSerialFooter, getTopologyFooter, getBlockFooter, default as blockMethods } from './lumiSysexLib';

import 'react-piano/dist/styles.css';
import './styles/App.css';

const decToHex = (num) => num.toString(16).toUpperCase().padStart(2, '0');
const getMessageString = bytesDec => bytesDec.map(decToHex).join(' ');

function App() {
    const [inputs, setInputs] = useState([]);
    const [selectedInput, setSelectedInput] = useState(null);
    const [selectedOutput, setSelectedOutput] = useState(null);
    const [notesOn, setNotesOn] = useState([]);
    const [topologies, setTopologies] = useState([topologyIndexAll]);
    const [selectedTopologyId, setSelectedTopologyId] = useState(null);
    const [currentOctave, setCurrentOctave] = useState(0);

    const addNote = useCallback((note) => {
        setNotesOn([...notesOn, note]);
    }, [notesOn]);
    const removeNote = useCallback((note) => {
        setNotesOn(notesOn.filter(n => n !== note));
    }, [notesOn]);

    const sendCommand = (type, values) => {
        if (selectedOutput) {
            let data;
            if (type === 'serial') {
                data = getSerialFooter();
            } else if (type === 'reset') {
                data = getTopologyFooter();
            } else {
                const method = blockMethods[type];
                if (method) data = getBlockFooter(selectedTopologyId, method(values));
            }
            console.log("OUT: " + getMessageString(data));
            if (!data) throw new Error('Unknown type');
            selectedOutput.sendSysex(getRoliHeader(), data);
        }
    }

    useEffect(() => {
        const setupMidi = async () => {
            await WebMidi.enable({ sysex: true });
            setInputs([...WebMidi.inputs]);
            const lumi = WebMidi.inputs.find(input => input.name.includes('LUMI'));
            if (lumi) (setSelectedInput(lumi));
        }
        setupMidi();
    }, []);

    useEffect(() => {
        if (selectedInput) {
            setSelectedTopologyId(topologyIndexAll)
            setSelectedOutput(WebMidi.getOutputByName(selectedInput.name));
            selectedInput.addListener("sysex", e => {
                console.log("IN : " + getMessageString(e.dataBytes));
                const [first, topology] = e.dataBytes;
                if (first === 0x77) { // Roli signature byte
                    // https://github.com/WeAreROLI/roli_blocks_basics/blob/main/protocol/roli_HostPacketDecoder.h#L48
                    const deviceTopology = topology & 63;
                    if (!topologies.includes(deviceTopology)) {
                        setTopologies([...topologies, deviceTopology]);
                    }
                }
            });
            selectedInput.addListener("noteon", e => {
                addNote(e.note.number);
            });
            selectedInput.addListener("noteoff", e => {
                removeNote(e.note.number);
            });
        }

        return () => {
            selectedInput?.removeListener("sysex");
            selectedInput?.removeListener("noteon");
            selectedInput?.removeListener("noteoff");
        }
    }, [selectedInput, addNote, removeNote, topologies]);

    const size = useContext(ResponsiveContext);

    const pianoWidth = size.includes('small') ? 300: 600;
    const piano = <Piano
        noteRange={{ first: (currentOctave + 4) * 12, last: (currentOctave + 6) * 12 - 1 }}
        width={pianoWidth}
        playNote={(note) => { selectedOutput?.sendNoteOn(note) }}
        stopNote={(note) => { selectedOutput?.sendNoteOff(note) }}
        disabled={false}
        activeNotes={notesOn}
        keyWidthToHeight={0.2}
    />

    const midiDeviceSelector = <Menu
        label={selectedInput?.name || "Midi Input Device"}
        items={inputs.map(input => ({ label: input.name, onClick: () => { setSelectedInput(input); } }))}
    />
    const blockSelector = <Menu
        label={selectedTopologyId?.toString() || "Block Short ID"}
        items={topologies.map(t => ({ label: t.toString(), onClick: () => { setSelectedTopologyId(t); } }))}
    />
    const colorMode = <Menu
        label="Color Mode"
        items={[0, 1, 2, 3].map((t, i) => ({ label: "Mode " + (t + 1).toString(), onClick: () => { sendCommand('colorMode', i); } }))}
    />
    const scales = <Menu
        label="Scale"
        items={scalesTypes.map(t => ({ label: t, onClick: () => { sendCommand('scale', t); } }))}
    />
    const root = <Menu
        label="Root Key"
        items={keysTypes.map(t => ({ label: t, onClick: () => { sendCommand('root', t); } }))}
    />
    const octave = <NumberInput min={-3} max={4} value={currentOctave} onChange={
        (e) => {
            if (!e.target.value) return;
            sendCommand('octave', e.target.value);
            setCurrentOctave(+e.target.value)
        }
    }
    />;
    const transpose = <RangeInput min={-11} max={11} onChange={(e) => { sendCommand('transpose', e.target.value); }} />;
    const channel = <RangeInput min={1} max={16} onChange={(e) => { sendCommand('channel', e.target.value); }} />;
    const brightness = <RangeInput min={0} max={100} onChange={(e) => { sendCommand('brightness', e.target.value); }} />;
    const fixedVelocity = <RangeInput min={0} max={127} onChange={(e) => { sendCommand('fixedVelocity', e.target.value); }} />;
    const sensitivity = <RangeInput min={0} max={127} onChange={(e) => { sendCommand('sensitivity', e.target.value); }} />;
    const strikeSensitivity = <RangeInput min={0} max={127} onChange={(e) => { sendCommand('strikeSensitivity', e.target.value); }} />;
    const pressureTracking = <RadioButtonGroup name="" options={[{ label: 'Poly Aftertouch', value: 0 }, { label: 'Channel Pressure', value: 1 }]} onChange={(e) => { sendCommand('pressureTracking', e.target.value); }} />;
    const fixedVelocityEnabled = <CheckBox label="Fixed Velocity" onChange={(e) => { sendCommand('fixedVelocityEnabled', +e.target.checked); }} />;

    return (
        <Page kind="wide">
            <Header
                background="brand"
                pad={{ left: "medium", right: "small", vertical: "small" }}
                elevation="medium"
            >
                <Text size="large">Lumi Keys Control</Text>
                {midiDeviceSelector}
                {blockSelector}
                <a href="https://github.com/xivilay/lumi-web-control">GitHub</a>
            </Header>
            <PageContent>
                <Box border pad="large" width="large">
                    <div className="keys-container" style={{ width: pianoWidth }}>{piano}</div>
                </Box>
                <Box border pad="medium" width="large">
                    <Grid columns={['1/2', '1/2']} gap="small">
                        <Form>
                            <FormField> {colorMode} </FormField>
                            <FormField> {scales} </FormField>
                            <FormField> {root} </FormField>
                            <label htmlFor="colorPicker0">
                                <FormField label="Primary color:">
                                    <input type="color" className="color-picker" id="colorPicker0" onInput={(e) => { sendCommand('color', [0, e.target.value]); }}></input>
                                </FormField>
                            </label>
                            <label htmlFor="colorPicker1">
                                <FormField label="Root color:">
                                    <input width="100%" type="color" className="color-picker" id="colorPicker1" onInput={(e) => { sendCommand('color', [1, e.target.value]); }}></input>
                                </FormField>
                            </label>
                            <FormField label="Brightness:"> {brightness} </FormField>
                            <FormField label="Channel:"> {channel} </FormField>
                            <FormField label="Transpose:"> {transpose} </FormField>
                            {/* <FormField><Button primary label="Request Serial" onClick={() => sendCommand('serial')} /></FormField> */}
                            {/* <FormField><Button primary label="Request Topology" onClick={() => sendCommand('reset')}></Button></FormField> */}
                        </Form>
                        <Form>
                            <FormField label="Octave:"> {octave} </FormField>
                            
                            <FormField label="Sensitivity:"> {sensitivity} </FormField>
                            <FormField label="Strike Sensitivity:"> {strikeSensitivity} </FormField>
                            <FormField label="Pressure tracking mode:"> {pressureTracking} </FormField>
                            <FormField label="Fixed velocity on:"> {fixedVelocityEnabled} </FormField>
                            <FormField label="Fixed Velocity Value:"> {fixedVelocity} </FormField>
                        </Form>
                    </Grid>
                </Box>

            </PageContent>
        </Page>
    );
}

export default App;
