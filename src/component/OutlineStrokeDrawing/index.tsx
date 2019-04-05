import React from 'react';
import { findNodeHandle, requireNativeComponent, NativeModules } from "react-native";
const { OutlineStrokeDrawingManager } = NativeModules;

const saveFunc = (handle, callback) => OutlineStrokeDrawingManager.save(handle, callback);
const OutlineStrokeDrawingView = requireNativeComponent('OutlineStrokeDrawing', null);

export class OutlineStrokeDrawing extends React.PureComponent<IProps, IState> {
    //private sketchRef: any = null;
    public constructor(props: IProps) {
        super(props);
        this.state = {
        };
    }

    componentWillReceiveProps(newProps: IProps) {
    }

    public save = (callback) => {
        saveFunc(findNodeHandle(this.refs.native), callback)
    }

    public render(): JSX.Element {

        return (
            <OutlineStrokeDrawingView 
                ref="native"
                {...this.props}
            />
        );
    }
}

interface IProps {
}

interface IState {
}

