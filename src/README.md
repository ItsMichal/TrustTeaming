# Trust Teaming Base Folder

- Contains `DataManager.py`, which singlehandedly manages connections and usage of the Redis DB and ORM. Providing a Facade/Adapter for it. Might move into its own folder just in case later- as with all other major sections

- `app.py` is currently the "main" application, but eventually will represent a single instance of the experiment- for possible parallelization on multiple ports.

- `TrustTeaming.py` will handle this parallelization and object management eventually