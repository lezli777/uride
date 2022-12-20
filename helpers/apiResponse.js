exports.success = (res, message) => {
    const resdata =
    {
        code: 200,
        status: true,
        message,
    }
    return res.json(resdata)
}

exports.successWithData = (res, message, data) => {
    const resdata = {
        code: 200,
        status: true,
        message,
        data
    }
    return res.json(resdata)
}

exports.errorResponse = (res, message) => {
    const resdata = {
        code: 400,
        status: false,
        message
    }
    return res.json(resdata);
}

exports.validationError = (res, message) => {
    const resdata = {
        code: 400,
        status: false,
        message
    }
    return res.json(resdata)
}