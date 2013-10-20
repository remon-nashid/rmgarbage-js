/**
 * an implementation of "Automatic Removal of 'Garbage Strings' in OCR Text" by
 * TAGHVA et al. at the ISRI.
 *
 * Also inspired by Perl and Ruby implementations of the same alghorithm.
 * Perl: https://github.com/zw/rmgarbage/blob/master/rmgarbage.pl
 * Ruby: https://github.com/documentcloud/docsplit/blob/master/lib/docsplit/text_cleaner.rb
 */

RE_WORD        = /\S+/
RE_SPACE       = /\s+/
RE_NEWLINE     = /[\r\n]/
RE_WHITESPACE  = XRegExp('\\p{White_space}+');
RE_ALNUM       = XRegExp('[\\p{L}\\p{N}]', 'ig')
RE_PUNCT       = XRegExp('\\p{P}', 'ig')
RE_REPEAT      = XRegExp('(\\P{N})\\1{3,}')
RE_UPPER       = XRegExp('\\p{Lu}', 'g')
RE_LOWER       = XRegExp('\\p{Ll}', 'g')
RE_ALL_ALPHA   = XRegExp('\\p{L}', 'g')
RE_ACRONYM     = XRegExp("^\\(?[\\p{Lu}\\p{N}\\.-]+('?s)?\\)?[.,:]?$")
RE_REPEATED    = /(\b\S{1,2}\s+)(\S{1,3}\s+){5,}(\S{1,2}\s+)/gm;

/**
 * Aternative to String.prototype.match
 * returns empty array rather than null to prevent
 * errors.
 */
String.prototype.smatch = function(regexp) {
  var result = this.match(regexp);
  if (!result) {
    result = [];
  }
  return result;
}

/**
 * API function
 */
function rmGarbage(text) {
  var cleaned = [];
  var words = text.split(RE_WHITESPACE);
  for (var i = 0; i < words.length; i++) {
    if (!isGarbage(words[i]))
      cleaned.push(words[i]);
  }
  return cleaned.join(' ').replace(RE_REPEATED, '');
}

/**
 * Is this word garbage?
 */
function isGarbage(w) {
  var acronym = RE_ACRONYM.test(w);

  // TODO unicode length
  // (L) If a string is longer than 40 characters, it is garbage
  return ((w.length > 40) ||
      // (R) If a string has 4 identical characters in a row, it is garbage.
      ( RE_REPEAT.test(w) ) ||

      // More punctuation than alpha numerics.
      (!acronym && (w.smatch(RE_ALNUM).length < w.smatch(RE_PUNCT).length)) ||

      // (P) Strip off the ﬁrst and last characters of a string.
      // If there are two distinct punctuation characters in the
      // result, then the string is garbage, so a,bc/defg is
      // garbage, ab,cde,fg is not.
      ( _.uniq(w.substring(1, w.length-1).smatch(RE_PUNCT)).length >= 2) ||

      // Number of uppercase letters greater than lowercase letters, but the word is
      // not all uppercase + punctuation.
      (!acronym && (w.smatch(RE_UPPER).length > w.smatch(RE_LOWER).length)));
}
