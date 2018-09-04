export default function _classStaticPrivateFieldSpecSet(receiver, classConstructor, privateClass, privateId, value) {
  if (receiver !== classConstructor) {
    throw new TypeError("Private static access of wrong provenance");
  }

  privateClass[privateId] = value;
  return value;
}