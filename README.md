# Trust Teaming (WIP)

[Video Link for Project 7](https://youtu.be/FspU1g7ndOk)

## About 
This webapp is the newly improved testbed for the Trust Teaming experiment conducted at the [SHINE Lab](https://shinelaboratory.com). Also the final project of [Michal Bodzianowski](https://michal.us) for the CSCI5448 - Object Oriented Analysis and Design class at CU Boulder

## Local Installation

**Prerequisite**- have a [Redis instance](https://redis.io/topics/quickstart) running locally reachable on 127.0.0.1:6379. If first time running make sure db 1 is empty.

1. Download or clone repo
2. `cd` into `TrustTeaming`
3. (Optionally in a venv) Run `pip3 install -r requirements.txt`
4. Run `npm install`
5. (**Development**) Set `FLASK_ENV` environment var to `development`
6. To start server- `npm run start`
7. (**Development**) Use `npm run build` or `npm run watch` to rebuild webpack items (.js, .jsx, .css)
8. Visit http://127.0.0.1:5000 on participant computers. Admin login is done by entering `SHINE` as the code. 

**Warning**- Do not trust sensitive data to this program. This is out of scope for this testbed's responsibilities.
**Note**- If using `npm` on Windows, please run `npm config set script-shell bash` so that the start script runs correctly

## Libraries used
- See `requirements.txt` and `package.json`

## Note about `crime.csv`

Please download this seperately, and put under `data/`.
