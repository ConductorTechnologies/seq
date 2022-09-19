const  Sequence = require("../dist/index.js")

describe("Sequence", () => {
  describe("create", () => {
    it("should create empty sequence", () => {
      const s = Sequence();
      expect([...s.frames()]).toEqual([]);
    });
    it("should create sequence from single numbers", () => {
      const s = Sequence(1);
      expect(s.frames()).toEqual([1]);
    });
    it("should create sequence from numbers first, last", () => {
      const s = Sequence(1, 10);
      expect(s.frames()).toHaveLength(10);
    });
    it("should create sequence from numbers first, last, step", () => {
      const s = Sequence(1, 10, 2);
      expect(s.frames()).toHaveLength(5);
    });

    it("should create sequence from negative numbers first, last", () => {
      const s = Sequence(-10, 10);
      expect(s.frames()).toHaveLength(21);
    });

    it("should create sequence from spec first", () => {
      const s = Sequence("1");
      expect(s.frames()).toEqual([1]);
    });

    it("should create sequence from spec first, last", () => {
      const s = Sequence("1-5");
      expect(s.frames()).toHaveLength(5);
    });

    it("should create sequence from spec first, last, step", () => {
      const s = Sequence("1-5x2");
      expect(s.frames()).toHaveLength(3);
    });
    it("should create sequence from complex spec", () => {
      const s = Sequence("2-4x2,8,10-23x3");
      expect(s.frames()).toHaveLength(8);
    });

    it("should create sequence from spec negative first, last, step", () => {
      const s = Sequence("-2-5x2");
      expect(s.frames()).toHaveLength(4);
    });

    it("should create sequence from spec negative first, negative last", () => {
      const s = Sequence("-12--5");
      expect(s.frames()).toHaveLength(8);
    });

    it("should throw with an invalid step", () => {
      expect(() => Sequence("1-2x-1")).toThrow();
      expect(() => Sequence("1-2x0")).toThrow();
    });

    it("should create sequence from array", () => {
      const s = Sequence([1, 2, 5, 6, 8, 9]);
      expect(s.frames()).toHaveLength(6);
    });

    it("should create sorted sequence from array", () => {
      const s = Sequence([1, 2, 9, 5, 6, 8]);
      expect(s.frames()).toEqual([1, 2, 5, 6, 8, 9]);
    });
  });

  describe("sequence info", () => {
    it("should return first frame", () => {
      const s = Sequence(1, 10);
      expect(s.first()).toEqual(1);
    });
    it("should return last frame", () => {
      const s = Sequence(1, 10);
      expect(s.last()).toEqual(10);
    });

    it("should know whether it's a progression", () => {
      const s = Sequence(1, 10);
      expect(s.isProgression()).toBe(true);
    });

    it("should know if it's not a progression", () => {
      const s = Sequence([1, 3, 5, 8]);
      expect(s.isProgression()).toBe(false);
    });

    it("should return step if its a progression", () => {
      const s = Sequence([1, 4, 7, 10]);
      expect(s.step()).toEqual(3);
    });

    it("should return step 1 if < 2 frames", () => {
      const s = Sequence(1);
      expect(s.step()).toEqual(1);
    });

    it("should return step 1 if empty", () => {
      const s = Sequence();
      expect(s.step()).toEqual(1);
    });

    it("should return undefined step if not a progression", () => {
      const s = Sequence([1, 4, 7, 11]);
      expect(s.step()).toBeUndefined();
    });
  });

  describe("chunks", () => {
    it("should init chunk size", () => {
      const s = Sequence();
      expect(s.chunkSize()).toEqual(1);
    });

    it("should set chunk size", () => {
      const s = Sequence();
      s.setChunkSize(10);
      expect(s.chunkSize()).toEqual(10);
    });

    it("should make chunks when chunksize 1 (default)", () => {
      const s = Sequence([1, 2, 3]);
      expect(s.chunks()).toHaveLength(3);
    });

    it("should make chunks when chunksize 2", () => {
      const s = Sequence([1, 2, 3, 4, 5, 6]);
      s.setChunkSize(2);
      expect(s.chunks()).toHaveLength(3);
    });

    it("should make 2 chunks (10/5) when not enforce progressions", () => {
      const s = Sequence([1, 2, 3, 5, 6, 7, 8, 10, 11, 12]);
      s.setChunkSize(5);
      const chunks = s.chunks(false);
      expect(chunks).toHaveLength(2);
    });
    it("should make 3 chunks when enforce progressions (default)", () => {
      const s = Sequence([1, 2, 3, 5, 6, 7, 8, 10, 11, 12]);
      s.setChunkSize(5);
      const chunks = s.chunks();
      expect(chunks).toHaveLength(3);
      expect(chunks[0].frames()).toEqual([1, 2, 3]);
      expect(chunks[1].frames()).toEqual([5, 6, 7, 8]);
      expect(chunks[2].frames()).toEqual([10, 11, 12]);
    });

    it("should find intersecting chunks", () => {
      const s = Sequence("1-12");
      s.setChunkSize(3); // 4 chunks
      const other = Sequence([1, 10]);
      const chunks = s.intersectingChunks(other);
      expect(chunks).toHaveLength(2);
      expect(chunks[0].frames()).toEqual([1, 2, 3]);
      expect(chunks[1].frames()).toEqual([10, 11, 12]);
    });
  });

  describe("progressions", () => {
    it("should create progression Sequences", () => {
      const s = Sequence([1, 2, 10, 11]);
      expect(s.progressions()).toHaveLength(2);
      expect(s.progressions()[0].spec()).toEqual("1-2");
      expect(s.progressions().every(p => p.isProgression())).toBe(true);
    });
  });

  describe("booleans", () => {
    it("should create intersection", () => {
      const a = Sequence([1, 2, 10, 11]);
      const b = Sequence([0, 2, 8, 11]);
      const c = a.intersection(b);
      expect(c.frames()).toEqual([2, 11]);
    });

    it("should create empty intersection", () => {
      const a = Sequence([1, 2, 10, 11]);
      const b = Sequence([110, 112, 118, 1111]);
      const c = a.intersection(b);
      expect(c.frames()).toEqual([]);
    });

    it("should create union", () => {
      const a = Sequence([1, 2, 10, 11]);
      const b = Sequence([0, 2, 8, 11]);
      const c = a.union(b);
      expect(c.frames()).toEqual([0, 1, 2, 8, 10, 11]);
    });

    it("should create difference", () => {
      const a = Sequence([1, 2, 10, 11]);
      const b = Sequence([0, 2, 8, 11]);
      const c = a.difference(b);
      expect(c.frames()).toEqual([1, 10]);
    });

    it("should create no difference", () => {
      const a = Sequence([1, 2, 10, 11]);
      const b = Sequence([1, 2, 10, 11]);
      const c = a.difference(b);
      expect(c.frames()).toEqual([]);
    });
  });

  describe("spec", () => {
    it("should return spec", () => {
      const s = Sequence(1, 10);
      expect(s.spec()).toEqual("1-10");
    });
    it("should return spec for single frame", () => {
      const s = Sequence(1);
      expect(s.spec()).toEqual("1");
    });
    it("should return spec for empty sequence", () => {
      const s = Sequence();
      expect(s.spec()).toEqual("");
    });
    it("should return spec for array", () => {
      const s = Sequence([1, 2, 5, 6, 8, 9]);
      expect(s.spec()).toEqual("1-2,5-6,8-9");
    });
    it("should return spec with negative start", () => {
      const s = Sequence([-6, -4, -2, 0, 2, 4, 6]);
      expect(s.spec()).toEqual("-6-6x2");
    });
    it("should return spec with all negative range", () => {
      const s = Sequence([-8, -6, -4]);
      expect(s.spec()).toEqual("-8--4x2");
    });
  });

  describe("math transformations", () => {
    it("should return offset sequence", () => {
      const s = Sequence(1, 10);
      expect(s.offset(5).spec()).toEqual("6-15");
    });
    it("should return scale sequence", () => {
      const s = Sequence(1, 10);
      expect(s.scale(3).spec()).toEqual("3-30x3");
    });
    it("should return filled sequence", () => {
      const s = Sequence(1, 10, 3);
      expect(s.fill().spec()).toEqual("1-10");
    });
  });

  describe("subsample", () => {
    it("should return subsampled sequence", () => {
      const s = Sequence("1-10");
      let ss = s.subsample(1);
      expect(ss.frames()).toEqual([6]);
      ss = s.subsample(2);
      expect(ss.frames()).toEqual([3, 8]);
      ss = s.subsample(3);
      expect(ss.frames()).toEqual([2, 6, 9]);
      ss = s.subsample(4);
      expect(ss.frames()).toEqual([2, 4, 7, 9]);
      ss = s.subsample(5);
      expect(ss.frames()).toEqual([2, 4, 6, 8, 10]);
      ss = s.subsample(6);
      expect(ss.frames()).toEqual([1, 3, 5, 6, 8, 10]);
      ss = s.subsample(7);
      expect(ss.frames()).toEqual([1, 3, 4, 6, 7, 8, 10]);
      ss = s.subsample(8);
      expect(ss.frames()).toEqual([1, 2, 4, 5, 6, 7, 9, 10]);
      ss = s.subsample(9);
      expect(ss.frames()).toEqual([1, 2, 3, 4, 6, 7, 8, 9, 10]);
      ss = s.subsample(10);
      expect(ss.frames()).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
      ss = s.subsample(11);
      expect(ss.frames()).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    });
  });
});
