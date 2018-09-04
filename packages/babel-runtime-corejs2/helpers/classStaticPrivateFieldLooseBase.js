function _classStaticPrivateFieldLooseBase(receiver, classConstructor) {
  if (receiver !== classConstructor) {
    throw new TypeError("Private static access of wrong provenance");
  }

  return classConstructor;
}

module.exports = _classStaticPrivateFieldLooseBase;