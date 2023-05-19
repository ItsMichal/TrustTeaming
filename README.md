# Trust Teaming (WIP)

---

## About

This webapp is the newly improved testbed for the Trust Teaming experiment
conducted at the [SHINE Lab](https://shinelaboratory.com).

---

## Installation for Usage

### Prerequisites

-   Have a [Redis instance](https://redis.io/topics/quickstart) running locally
    reachable on 127.0.0.1:6379. If first time running make sure db 1 is empty.
-   This project was built using `python3.10` and the library versions in
    `frozen_req.txt`. Try switching to these if future versions break (or better
    yet, create a PR if you can migrate/upgrade!)
-   (**For Developers**) Set `FLASK_ENV` environment var to `development`

### Installation Steps

1. Download or clone repo
2. `cd` into `TrustTeaming`
3. Run `pip3 install -r requirements.txt`
4. Run `npm install`
5. To start server- `npm run start`
6. Run `npm run build` to build the web scripts.
    - (**For Developers**) Use `npm run dev-watch` instead to rebuild webpack
      items (.js, .jsx, .css)
7. Visit http://127.0.0.1:8080 on participant computers. Admin login is done by
   entering `SHINE` as the code.

### Installation Notes/Help

**Important** - Make sure `eventlet` and `gevent` are not installed in your
environment for now.

**Warning**- Do not trust sensitive data to this program (read- passwords). This
is out of scope for this testbed's responsibilities.

**Note**- If using `npm` on Windows, please run
`npm config set script-shell bash` so that the start script runs correctly

**Note**- Sample config CSVs available under `/samples`

---

## Developer Notes

-   Please maintain styling using Prettier
-   Currently no CI/CD setup, but coming soon?
-   Also needs Dockerization
-   Otherwise, modular setup, and adding new features appreciated

### Libraries used

-   See `requirements.txt` and `package.json`

### Note about `crime.csv`

Initial versions of this projects relied on a large database of Denver crime
data in a `crime.csv` file. This is available upon request, but we now use
`src/data/updatedcrimedata`, a compressed and Pandas optimized version of the
data. See `src/data/datagenerator.ipynb` for details.

### License and Usage

Please contact Dr. Leanne Hirshfield at the SHINE Laboratory
([shine.lab@colorado.edu](mailto:shine.lab@colorado.edu)) for access and usage
within your lab. A proper licensing system is in the works, for now all rights
reserved SHINE Laboratory.

---

## CSCI5448 - Object Oriented Analysis and Design

This was also submitted as the final project for Michal Bodzianowski's CSCI5548
class at the University of Colorado Boulder.

[Video Link](https://youtu.be/FspU1g7ndOk)
