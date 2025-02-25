class ApiError extends Error {
    constructor(code, message) {
        super(message)
        this.code = code;
    }

    static badRequest(msg = "Client did something wrong") {
        return new ApiError(400, msg);
    }

    static internal(msg = "Something went wrong on server's side") {
        return new ApiError(500, msg);
    }
}

export default ApiError;