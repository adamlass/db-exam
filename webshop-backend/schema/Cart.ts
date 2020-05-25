
import mongoose, { Schema, Document } from 'mongoose'
import Line, { ILine, LineSchema } from './Line'

export interface ICart extends Document {
    custId: String
    lines: ILine[]
}

let schema = new Schema({
    custId: {type: String, required: true},
    lines: {type: [LineSchema], required: true, default:[] }
})

export default mongoose.model<ICart>("Cart", schema)