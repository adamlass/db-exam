export default class MyError extends Error {
    constructor(message: string="Unknown Error", public status: number = 500){
        super(message)
        this.name = "MyError"
        Object.setPrototypeOf(this, MyError.prototype);
    }
}