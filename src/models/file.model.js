import { Schema, model } from 'mongoose';

const versionSchema = new Schema({
  numero:  { type: Number, required: true },
  cambios: { type: String, required: true },
  fecha:   { type: Date,   required: true }
}, { _id: false });

const fileSchema = new Schema({
  id_recurso:      { type: Number, required: true, index: true },
  archivo:         { type: String, required: true },
  tipo:            { type: String, enum: ['pdf','imagen','video'], required: true },
  eliminado:       { type: Boolean, default: false },
  eliminado_por:   { type: Number },
  fecha_eliminado: { type: Date },
  versiones:       { type: [versionSchema], default: [] }
}, {
  timestamps: true,
  collection: 'files'
});

export default model('File', fileSchema);