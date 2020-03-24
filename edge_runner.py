import glob
import json
from collections import defaultdict
from hashlib import md5
from argparse import ArgumentParser

file_list = glob.glob("onionscan_results/*.json")

hidden_services = set()
onion_domains = defaultdict(lambda: [])
clearnet_domains = defaultdict(lambda: [])
ip_addresses = defaultdict(lambda: [])


"""
Generate UID for hidden_service, ip_address and clearnet_service
"""


def get_id(value):
    return value.replace('.', '_').replace(';', '__').replace('&', '_')


"""
Generate the JSON data to create Hive chart
x = 0 is a hidden service node
x = 1 is an ip address node
x = 2 is a clearnet service node

"""


def create_json(hidden_services, clearnet_domains, ip_addresses):

    data = {}
    data["nodes"] = []
    data["links"] = []
    for hidden_service in hidden_services:
        data["nodes"].append({
            "id": get_id(hidden_service),
            "type": "hidden_service",  "name": hidden_service, "x": 0, "y": 0})
    for ip_address, hidden_services in ip_addresses.items():
        data["nodes"].append({
            "id": get_id(ip_address),
            "type": "hidden_service",  "name": ip_address, "x": 1, "y": 0})
        for hidden_service in hidden_services:
            data["links"].append({
                "source": get_id(ip_address),
                "target": get_id(hidden_service)
            })
    for clearnet_service, hidden_services in clearnet_domains.items():
        data["nodes"].append({
            "id": get_id(clearnet_service),
            "type": "clearnet_service", "name": clearnet_service, "x": 2, "y": 0})
        for hidden_service in hidden_services:
            data["links"].append({
                "source": get_id(clearnet_service),
                "target": get_id(hidden_service)
            })
    with open("hive_data.json", "w") as outfile:
        json.dump(data, outfile)


"""
Generating .dot file for visualizing data in jhive
"""


def create_dot(hidden_services, clearnet_domains, ip_addresses):

    with open("data.dot", "w") as f:
        f.write("digraph DarkNet {\n")
        for hidden_service in hidden_services:
            f.write(
                f"{get_id(hidden_service)} [service_type=hidden name={hidden_service} incoming_links={len(onion_domains[hidden_service])}]\n")

        # for onion_domain, hidden_services in onion_domains.items():
        #     # f.write(
        #     #     f"{get_id(onion_domain)} [type=hidden_service name={onion_domain}]\n")
        #     f.writelines(map(
        #         lambda hidden_service: f"{get_id(hidden_service)} -> {get_id(onion_domain)}\n", hidden_services))

        for clearnet_domain, hidden_services in clearnet_domains.items():
            f.write(
                f"{get_id(clearnet_domain)} [service_type=clearnet name={clearnet_domain}]\n")
            f.writelines(map(
                lambda hidden_service: f"{get_id(hidden_service)} -> {get_id(clearnet_domain)}\n", hidden_services))

        for ip_address, hidden_services in ip_addresses.items():
            f.write(
                f"{get_id(ip_address)} [service_type=ip name={ip_address}]\n")
            f.writelines(map(
                lambda hidden_service: f"{get_id(hidden_service)} -> {get_id(ip_address)}\n", hidden_services))
        f.write("}")


"""
ArgParser to create .dot file or JSON file
"""


def parse_args():
    parser = ArgumentParser(
        description="format onionscan data for visualization in D3 or jhive.")
    parser.add_argument("-json", action='store_true',
                        help="generate JSON file for D3")
    parser.add_argument("-dot", action='store_true',
                        help="generate .dot file for jhive")
    return parser.parse_args()


def main(args):

    for json_file in file_list:

        with open(json_file, "rb") as fd:

            scan_result = json.load(fd)

            hidden_services.add(scan_result['hiddenService'])
            edges = []

            if scan_result['linkedSites'] is not None:
                edges.extend(scan_result['linkedSites'])

            if scan_result['relatedOnionDomains'] is not None:
                edges.extend(scan_result['relatedOnionDomains'])

            if scan_result['relatedOnionServices'] is not None:
                edges.extend(scan_result['relatedOnionServices'])

            for edge in edges:
                if edge.endswith(".onion"):
                    onion_domains[edge].append(scan_result['hiddenService'])
                    hidden_services.add(edge)
                else:
                    clearnet_domains[edge].append(scan_result['hiddenService'])

            if scan_result['ipAddresses'] is not None:
                for ip in scan_result['ipAddresses']:
                    ip_addresses[ip].append(scan_result['hiddenService'])
    if args.json:
        create_json(hidden_services, clearnet_domains, ip_addresses)
    elif args.dot:
        create_dot(hidden_services, clearnet_domains, ip_addresses)
    else:
        return


if __name__ == '__main__':
    args = parse_args()
    main(args=args)
