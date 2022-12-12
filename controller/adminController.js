const express = require('express');
const signDB = require('../models/signup.model.js')
const config = require('../config/db.js')
const jwt = require('jsonwebtoken');
const {
    success,
    successWithData,
    errorResponse,
    validationError
} = require('../helpers/apifunctions.js')
const fs = require('fs');
const path = require('path');

module.exports = {
    signup: async function (req, res) {
        try {
            const {
                email,
                username,
                password
            } = req.body;
            if (!(email && username && password)) {
                return validationError(res, "required all fields")
            }

            const user = await signDB.create({
                email: email,
                username: username,
                password: password
            })

            var token = jwt.sign({
                    id: user._id
                },
                config.secert, {
                    expiresIn: 86400
                }
            )
            user.jwttoken = token;
            user.status = 1;

            user.save((err, doc) => {
                if (err) {
                    return errorResponse(res, 'Error')
                } else {
                    return successWithData(res, 'Data Submitted Successfully', doc)
                }
            })

        } catch (err) {
            console.log(err);
        }
    },

    login: async function (req, res) {
        try {
            const {
                email,
                password
            } = req.body
            if (!(email && password)) {
                return validationError(res, 'Required All fields')
            } else {
                const data = await signDB.findOne({
                    email,
                    password
                });
                if (data) {
                    var token = jwt.sign({
                        id: data._id
                    }, config.secert, {
                        expiresIn: 86400
                    })
                    data.jwttoken = token;
                    const update = await data.updateOne({
                        token
                    }, {
                        jwttoken: data.token
                    })
                    if (update) {
                       return success(res, 'Login Successfully')
                    } else {
                        return errorResponse(res, 'Please Try Again')
                    }
                } else {
                    return errorResponse(res, 'Data Not Found')
                }
            }
        } catch (err) {
            console.log(err);
        }
    },
}