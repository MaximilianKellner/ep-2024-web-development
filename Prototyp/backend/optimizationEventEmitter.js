import events from 'events';
import updateCredits from './updateCredits.js';

class OptimizationEventEmitter extends events.EventEmitter {

    // TODO: Prozentangabe an den Client senden
    progress = 0;
    constructor() {
        super();
    }

    sendProgressStatus(status, fileName) {
        console.log("Progress status: ", status, fileName);
        this.emit('progress', status, fileName);
    }

    updateCredits(userId) {
        updateCredits(userId);
        this.emit('updateCredits');
    }

    resetProgress() {
        this.progress = 0;
    }
}

const optimizationEventEmitter = new OptimizationEventEmitter();

export default optimizationEventEmitter;