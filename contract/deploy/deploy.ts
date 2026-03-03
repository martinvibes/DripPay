import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  const deployedFactory = await deploy("OrganizationFactory", {
    from: deployer,
    log: true,
  });

  console.log(`\nOrganizationFactory deployed to: ${deployedFactory.address}`);
  console.log(`\nAdd to frontend .env:`);
  console.log(`NEXT_PUBLIC_FACTORY_ADDRESS=${deployedFactory.address}`);
};

export default func;
func.id = "deploy_organization_factory";
func.tags = ["OrganizationFactory"];
