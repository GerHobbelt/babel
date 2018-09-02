function _classStaticPrivateFieldSpecGet(receiver, classConstructor, privateClass, privateId) {
  if (receiver !== classConstructor) {
    throw new TypeError("Private static access of wrong provenance");
  }

  return privateClass[privateId];
}

module.exports = _classStaticPrivateFieldSpecGet;