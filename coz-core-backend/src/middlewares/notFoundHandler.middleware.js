const notFoundHandler = (req, res, next) => {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    res.status(404);
    console.log(error);
    next(error);
};

const errorHandler = (err, req, res, next) => {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    console.log(err);
    res.status(statusCode).json({ message: err.message });
};

export {
    errorHandler,
    notFoundHandler,
};
