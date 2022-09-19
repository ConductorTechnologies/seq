

/** 
 * 
 * @author Julian Mann
 * 
*/


/**
 * Represents a sequence of integers to be used for frames of animation. Supports chunking.
 * @param  {...args} args
 * @returns Object containing public functions to manage a sequence of frame numbers.
 *
 * @constructor
 * @example 
 * Sequence() // An empty Sequence.
 * Sequence(1, 10) // 1-10
 * Sequence(1, 10, 2) // 1-10x2
 * Sequence("1-10x2") // 1-10x2
 * Sequence("1-10x2, 20-30x5") // 1-10x2, 20-30x5
 * Sequence([1, 2, 3, 4, 5]) // 1-5
 * Sequence(-10, -2) // -10--2
 * 
 */
 const Sequence = (...args) => {
    const PROGRESSION_SPEC_REGEX =
      /^(?<first>-?\d+)(-(?<last>-?\d+)(x(?<step>[1-9][0-9]*))?)?$/;
    const SPLIT_SPEC_REGEX = /[\s,,]+/;
  
    const _frames = [];
    let _chunkSize = 1;
  
    const _flatten = (...args) => {
      if (args.length === 0) {
        return [];
      } else if (typeof args[0] === "number") {
        return _range(...args);
      } else if (typeof args[0] === "string") {
        const spec = args[0];
        const errmsg =
          "Please provide a valid set of frames. Example: 1, 2-5, 10-20x2";
        let result = spec.split(SPLIT_SPEC_REGEX).reduce((accum, _) => {
          const match = _.match(PROGRESSION_SPEC_REGEX);
          if (match) {
            let { first, last, step } = match.groups;
            accum.push(..._range(first, last, step));
          } else {
            throw RangeError(errmsg);
          }
          return accum;
        }, []);
        return [...new Set(result)].sort((a, b) => (a < b ? -1 : 1));
      } else if (Array.isArray(args[0])) {
        return [...new Set(args[0].map(f => Math.trunc(f)))].sort((a, b) =>
          a < b ? -1 : 1
        );
      }
    };
  
    const _range = (first, last, step) => {
      first = Math.trunc(first);
      last = last === undefined ? first : Math.trunc(last);
      step = step === undefined ? 1 : Math.trunc(step);
  
      [first, last] = [first, last].sort((a, b) => (a < b ? -1 : 1));
      const stepVal = Math.max(1, step);
      const result = [];
      for (let i = first; i <= last; i += stepVal) {
        result.push(i);
      }
      return result;
    };
  
    const _isProgression = arr => {
      if (arr.length < 3) {
        return true;
      }
      const gap = arr[1] - arr[0];
      return !arr.some((_, i, arr) => {
        if (i < 1) {
          return false;
        }
        return arr[i] - arr[i - 1] !== gap;
      });
    };
  
    const _spec = arr =>
      arr.length === 0
        ? ""
        : _progressions(arr)
            .map(p => {
              if (p.length === 1) {
                return `${p[0]}`;
              }
              const gap = p[1] - p[0];
              if (gap === 1) {
                return `${p[0]}-${p[p.length - 1]}`;
              }
              return `${p[0]}-${p[p.length - 1]}x${gap}`;
            })
            .join(",");
  
    const _progressions = arr => {
      const results = [[]];
      let i = 0;
      [...arr]
        .sort((a, b) => (a < b ? -1 : 1))
        .forEach(element => {
          const curr = results[i];
          if (
            !(
              curr.length < 2 ||
              curr[1] - curr[0] === element - curr[curr.length - 1]
            )
          ) {
            i++;
            results.push([]);
          }
          results[i].push(element);
        });
      return results;
    };
  
    _frames.push(..._flatten(...args));
  
    /**
     * @function
     * @returns {Array} The frames in the sequence.
     */
    const frames = () => _frames;
  
    /**
     * @function
     * @returns {number} The first frame in the sequence.
     */
    const first = () => _frames[0];
  
    /**
     * @function
     * @returns {number} The last frame in the sequence.
     */
    const last = () => _frames.slice(-1)[0];
  
    /**
     * @function
     * @returns {String} A compact representation of the sequence.
     * @example
     * Sequence(1, 10, 2).spec() // "1-10x2"
     */
    const spec = () => _spec(_frames);
  
    /**
     * @function
     * @returns {boolean} True if the sequence is an arithmetic progression.
     */
    const isProgression = (arr = _frames) => {
      return _isProgression(arr);
    };
  
    /**
     * @function
     * @returns {number|undefined} The step size of the sequence if it is a progression, otherwise
     * undefined.
     */
    const step = () =>
      _isProgression(_frames)
        ? _frames.length > 1
          ? _frames[1] - _frames[0]
          : 1
        : undefined;
    
    /**
     * @function
     * @returns {number} The number of frames in the sequence.
     */
    const length = () => _frames.length;
  
    /**
     * Set the maximum size of chunks to be returned by the chunks() function.
     * @function
     * @param {number} value The value to set.
     */
    const setChunkSize = value => {
      _chunkSize = Math.max(1, value);
    };
  
    /**
     * @function
     * @returns {number} The maximum size of chunks to be returned by the chunks() function.
     */
    const chunkSize = () => _chunkSize;
    
    /**
     * 
     * @returns {Array} An array of Sequences, each containing a set of frames that form an
     * arithmetic progression.
     * @example
     * const s = Sequence([1, 2, 3, 10, 13, 16]);
     * // 1-3
     * // 10-16x3
     */
    const progressions = () => _progressions(_frames).map(p => Sequence(p));
  
    /**
     * Return Sequences that represent chunks of the current sequence.
     * @function
     * @param {boolean} enforceProgressions 
     * @returns {Array<Sequence>} An array of Sequences.
     */
    const chunks = (enforceProgressions = true) => {
      const result = [];
      let chunk = [];
  
      _frames.forEach((f, i, arr) => {
        chunk.push(f);
  

        
        let doNewChunk = false;
        if (chunk.length === _chunkSize) {
          // Packed the chunk
          doNewChunk = true;
        } else if (i === arr.length - 1) {
          // It was the last frame
          doNewChunk = true;
        } else if (
          enforceProgressions &&
          !_isProgression([...chunk, arr[i + 1]])
        ) {
          // It was the last frame in a progression
          doNewChunk = true;
        }
  
        if (doNewChunk) {
          result.push(Sequence(chunk));
          chunk = [];
        }
      });
      return result;
    };
    
    /**
     * Test if the sequence overlaps with another sequence.
     * @function
     * @param {Sequence} other
     * @return {boolean} True if the sequences overlap. 
     */
    const intersects = other => {
      if (first() > other.last() || last() < other.first()) {
        return false;
      }
      const other_frames = other.frames();
      return _frames.some(f => other_frames.includes(f));
    };
    
    /**
     * @function
     * @param {Sequence} other
     * @returns {Sequence} A new sequence that is the intersection of the two sequences.
     * @example
     * Sequence([1, 2, 10, 11]).intersection(Sequence([2, 3, 11, 12])) // Sequence([2, 11])
     */
    const intersection = other => {
      const other_frames = other.frames();
      return Sequence(_frames.filter(f => other_frames.includes(f)));
    };

    /**
     * @function
     * @param {Sequence} other
     * @returns {Sequence} A new sequence that is the union of the two sequences.
     * @example
     * Sequence([1, 2, 10, 11]).union(Sequence([2, 3, 11, 12])) // Sequence([1, 2, 3, 10, 11, 12])
     */
    const union = other => {
      return Sequence([..._frames, ...other.frames()]);
    };

    /**
     * @function
     * @param {Sequence} other
     * @returns {Sequence} A new sequence that is the difference of the two sequences.
     * @example
     * Sequence([1, 2, 10, 11]).difference(Sequence([2, 3, 11, 12])) // Sequence([1, 10])
     */
    const difference = other => {
      const other_frames = other.frames();
      return Sequence(_frames.filter(f => !other_frames.includes(f)));
    };
  
    /**
     * @function
     * @returns {Sequence} A new sequence that is offset by the given amount.
     * @example
     * Sequence([1, 2, 10, 11]).offset(2) // Sequence([3, 4, 12, 13])
     */
    const offset = value => {
      const s = Sequence(_frames.map(f => f + value));
      s.setChunkSize(_chunkSize);
      return s;
    };
    
    /**
     * @function
     * @returns {Sequence} A new sequence whose elements are the elements of the current sequence
     * multiplied by the given value.
     * @example
     * Sequence([1, 2, 10, 11]).scale(2) // Sequence([2, 4, 20, 22])
     */ 
    const scale = value => {
      const s = Sequence(_frames.map(f => Math.trunc(f * value)));
      s.setChunkSize(_chunkSize);
      return s;
    };
  
    /**
     * @function
     * @returns {Sequence} A new sequence where all gaps have been filled.
     * @example
     * Sequence([1, 2, 10, 11]).fill() // Sequence([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11])
     */
    const fill = (step = 1) => {
      const s = Sequence(first(), last(), step);
      s.setChunkSize(_chunkSize);
      return s;
    };
 

    /**
     * @function
     * @returns {Array<Sequence>} An array of Sequences that represent the chunks of the other
       Sequence that overlap with the current Sequence. const intersectingChunks = other =>
       chunks().filter(c => c.intersects(other));
     * @example
     * s = Sequence("1-12");
     * s.setChunkSize(3); 
     * const chunks = s.intersectingChunks(Sequence([1, 10]));
     * // [Sequence([1, 2, 3]), Sequence([10, 11, 12])]
    */
    const intersectingChunks = other => chunks().filter(c => c.intersects(other));
  
    /**
     * A Sequence containing a sampling of frames from the current sequence.
     * @function
     * @returns {Sequence}
     * @param {number} count The number of frames to sample.
     */
    const subsample = count => {
      const n = _frames.length;
      count = Math.min(Math.max(1, count), n);
      const result = [];
      const gap = n / count;
      let pos = gap / 2.0;
      for (let i = 0; i < count; i++) {
        result.push(_frames[Math.floor(pos)]);
        pos += gap;
      }
      return Sequence(result);
    };
  
    return Object.freeze({
      frames,
      first,
      last,
      step,
      length,
      setChunkSize,
      chunkSize,
      chunks,
      isProgression,
      spec,
      progressions,
      intersects,
      intersection,
      union,
      difference,
      offset,
      scale,
      fill,
      intersectingChunks,
      subsample
    });
  };
  
  module.exports =  Sequence