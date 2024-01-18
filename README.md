# Trust Teaming <small><small>| Beta <small><small>v2023.05</small></small></small></small>

---

## About

This webapp is the newly improved testbed for the Trust Teaming experiment
conducted at the [SHINE Lab](https://shinelaboratory.com).

### License and Usage

[![CC BY-NC-SA 4.0][cc-by-nc-sa-shield]][cc-by-nc-sa]

This work is licensed under a [Creative Commons
Attribution-NonCommercial-ShareAlike 4.0 International License][cc-by-nc-sa].

[![CC BY-NC-SA 4.0][cc-by-nc-sa-image]][cc-by-nc-sa]

[cc-by-nc-sa]: http://creativecommons.org/licenses/by-nc-sa/4.0/
[cc-by-nc-sa-image]: https://licensebuttons.net/l/by-nc-sa/4.0/88x31.png
[cc-by-nc-sa-shield]:
    https://img.shields.io/badge/License-CC%20BY--NC--SA%204.0-lightgrey.svg

**Commercial usage is restricted, remixes allowed with proper attribution and
same license!**

Please attribute code to [Michal Bodzianowski](https://michal.us), as well as
citing the following paper in research publications using this code:

Philip Bobko, Leanne Hirshfield, Lucca Eloy, Cara Spencer, Emily Doherty, Jack
Driscoll & Hannah Obolsky (2023) Human-agent teaming and trust calibration: a
theoretical framework, configurable testbed, empirical illustration, and
implications for the development of adaptive systems, Theoretical Issues in
Ergonomics Science, 24:3, 310-334,
[DOI: 10.1080/1463922X.2022.2086644](https://www.tandfonline.com/doi/full/10.1080/1463922X.2022.2086644)

For any concerns, please reach out to the
[SHINE Laboratory via their website](https://www.colorado.edu/lab/shine)

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

---

## CSCI5448 - Object Oriented Analysis and Design

This was also submitted as the final project for Michal Bodzianowski's CSCI5548
class at the University of Colorado Boulder.

[Video Link](https://youtu.be/FspU1g7ndOk)
