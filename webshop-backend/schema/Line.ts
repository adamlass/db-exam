
import mongoose, { Schema, Document } from 'mongoose'

export interface ILine extends Document {
    name: string
    itemId: string,
    amount: number
}

export let LineSchema = new Schema({
    itemId: {type: String, required: true},
    amount: {type: Number, required: true}
})

export default mongoose.model<ILine>("Line", LineSchema)