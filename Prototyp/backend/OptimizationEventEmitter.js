import events from 'events';

class OptimizationEventEmitter extends events.EventEmitter {

    constructor() {
        super();
    }

    sendProgressStatus(status, fileName, credits) {
        console.log("Progress status: ", status, fileName, credits);
        this.emit('progress', status, fileName, credits);
    }
}

const optimizationEventEmitter = new OptimizationEventEmitter();

export default optimizationEventEmitter;