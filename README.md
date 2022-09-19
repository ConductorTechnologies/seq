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


## Dev

```
git clone git@github.com:ConductorTechnologies/seq.git

yarn
```

## Build

Trasnpiles into `./dist/index.html`
```
yarn build
```

## Test

Tests the code in `./dist/index.html` (not `./src/index.html`)
```
yarn test
```

## Generate Docs
```
yarn doc
```

Then open `./doc/index.html` in a browser.
