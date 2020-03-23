import os
import json
from os.path import join


def main():
    master_onion_list = []
    for file in os.listdir("onionscan_results"):
        if(file.endswith(".json")):
            with open(join("onionscan_results", file), "r") as f:
                try:
                    hs_obj = json.load(f)
                    del hs_obj['snapshot']
                    master_onion_list.append(hs_obj)
                except Exception as ex:
                    print(f"Failed to load {file} due to: {ex}")

    with open("master_onionscan_results.json", "w") as wf:
        json.dump(master_onion_list, wf)


if __name__ == "__main__":
    main()
