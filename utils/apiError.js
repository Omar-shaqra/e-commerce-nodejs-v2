// @desc this class is responsable about  operation error (errors that i can predict)


class ApiError extends Error{
    constructor(message , statusCode){
     
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith(4) ? 'fail' : 'errr';
        this.isOpertional = true;

    }

    
}




module.exports= ApiError;
