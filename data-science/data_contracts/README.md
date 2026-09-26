# Data Contracts

This directory contains data contracts for the data science components of the Lucky Parking project.

## What are Data Contracts?

Data contracts are formal agreements between data producers and consumers that define the structure, quality, and semantics of data. They ensure data reliability and consistency across different components of the system.

## Structure

Each data contract specifies:
- Schema definition (fields, types, constraints)
- Data quality expectations (nullability, uniqueness, ranges)
- Semantic meaning of data elements
- Versioning information

## Usage

Data contracts are used by:
- Data validation pipelines
- ETL processes
- API interfaces between services
- Machine learning model training and inference

## Files

- `schema.json`: JSON Schema definitions for data entities
- `contracts.yaml`: YAML files describing specific data contracts
- `examples/`: Sample data instances that conform to the contracts

## Contributing

When adding or modifying data contracts:
1. Ensure backward compatibility where possible
2. Update version numbers appropriately
3. Provide clear documentation of changes
4. Add examples demonstrating correct usage
5. Update any dependent consumers of the contract

## Maintenance

Data contracts should be reviewed periodically to ensure they remain accurate reflections of the data being produced and consumed.