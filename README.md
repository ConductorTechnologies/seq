# seq
Manage sequences of frame numbers

## Install

```bash
npm install @conductortech/seq

# OR

yarn add @conductortech/seq
```

## Usage

```
import Sequence from "@conductortech/seq"

s = Sequence("1-10x2")

s.first();
> 1

s.last();
> 10
```

Full documentation [here](./out/Sequence.html)