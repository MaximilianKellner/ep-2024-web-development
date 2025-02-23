import ApiError from "./ApiError.js";

function handleApiError(err, req, res, next) {

    console.error(err);

    if (err instanceof ApiError) {
        res.status(err.code).json({error: err.message});
        return;
    }

    res.status(500).json({error: "Something went wrong"});
}

export default handleApiError;