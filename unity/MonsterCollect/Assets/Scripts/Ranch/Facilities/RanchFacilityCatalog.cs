using UnityEngine;

namespace MonsterCollect.Ranch
{
    [CreateAssetMenu(fileName = "RanchFacilityCatalog", menuName = "Monster Collect/Ranch Facility Catalog")]
    public class RanchFacilityCatalog : ScriptableObject
    {
        public const string DefaultResourcePath = "Ranch/RanchFacilityCatalog";

        public RanchFacilityDefinition[] Facilities = System.Array.Empty<RanchFacilityDefinition>();

        public RanchFacilityDefinition FindById(string facilityId)
        {
            if (string.IsNullOrEmpty(facilityId) || Facilities == null)
            {
                return null;
            }

            for (int i = 0; i < Facilities.Length; i++)
            {
                RanchFacilityDefinition facility = Facilities[i];
                if (facility != null && facility.FacilityId == facilityId)
                {
                    return facility;
                }
            }

            return null;
        }
    }
}
