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

exports.notFound = (res, message) => {
    const resdata = {
        code: 501,
        status: false,
        message
    }
    return res.json(resdata);
}

exports.notifySuccess = (response, message) => {
    const resdata =
    {
        code: 200,
        status: true,
        message,
    }
    return response.json(resdata)
}

exports.notifyError = (response, message) => {
    const resdata =
    {
        code: 400,
        status: false,
        message,
    }
    return response.json(resdata)
}