import glob
import json
from collections import defaultdict
from hashlib import md5

file_list = glob.glob("onionscan_results/*.json")

hidden_services = set()
onion_domains = defaultdict(lambda: [])
clearnet_domains = defaultdict(lambda: [])
ip_addresses = defaultdict(lambda: [])


def get_id(value):
    return value.replace('.', '_').replace(';', '__').replace('&', '_')


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
        f.write(f"{get_id(ip_address)} [service_type=ip name={ip_address}]\n")
        f.writelines(map(
            lambda hidden_service: f"{get_id(hidden_service)} -> {get_id(ip_address)}\n", hidden_services))
    f.write("}")
