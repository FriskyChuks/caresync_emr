from django.db import models
from accounts.models import CustomUser

class Clinic(models.Model):
    name = models.CharField(max_length=100)
    male_only = models.BooleanField(default=False)
    female_only = models.BooleanField(default=False)
    created_by = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        if self.female_only:
            return f"{self.name} (Female Only)"
        elif self.male_only:
            return f"{self.name} (Male Only)"
        return self.name

class Ward(models.Model):
    name = models.CharField(max_length=100)
    clinic = models.ForeignKey(Clinic, on_delete=models.CASCADE, related_name='wards', null=True, blank=True)
    female_only = models.BooleanField(default=False)
    male_only = models.BooleanField(default=False)
    created_by = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        if self.female_only and self.clinic:
            return f"{self.name}  - {self.clinic.name} (Female Only)"
        elif self.female_only:
            return f"{self.name} (Female Only)"
        elif self.male_only and self.clinic:
            return f"{self.name}  - {self.clinic.name} (Male Only)"
        elif self.male_only:
            return f"{self.name} (Male Only)"
        return self.name
    

class Room(models.Model):
    ward = models.ForeignKey(
        "locations.Ward",
        on_delete=models.CASCADE,
        related_name="rooms"
    )
    name = models.CharField(max_length=50)  # e.g. "Room A", "ICU"
    bed_count = models.PositiveIntegerField(default=1)  # total beds in this room
    sealed_beds = models.JSONField(default=list, blank=True)  # bed numbers marked unavailable

    class Meta:
        unique_together = ("ward", "name")
        ordering = ["ward__name", "name"]

    def __str__(self):
        return f"{self.ward.name} - {self.name}"

    def all_beds(self):
        """Return all possible bed numbers in this room."""
        return list(range(1, self.bed_count + 1))

    def available_beds(self, current_assignments=None):
        """
        Returns a sorted list of free bed numbers in this room.
        `current_assignments` should be a list of bed numbers currently occupied.
        """
        if current_assignments is None:
            current_assignments = []

        all_beds = set(self.all_beds())
        unavailable = set(self.sealed_beds) | set(current_assignments)
        return sorted(all_beds - unavailable)

    def can_reduce_beds(self, new_count, current_assignments=None):
        """
        Ensure bed_count is not reduced below the highest occupied bed number.
        """
        if current_assignments is None:
            current_assignments = []

        if not current_assignments:
            return True  # safe to reduce
        highest_occupied = max(current_assignments)
        return new_count >= highest_occupied

    def seal_bed(self, bed_number):
        """
        Mark a bed as unavailable (sealed). 
        """
        if bed_number < 1 or bed_number > self.bed_count:
            raise ValueError("Invalid bed number")
        if bed_number not in self.sealed_beds:
            self.sealed_beds.append(bed_number)
            self.save()

    def unseal_bed(self, bed_number):
        """Remove a bed from sealed beds to make it available again."""
        if bed_number in self.sealed_beds:
            self.sealed_beds.remove(bed_number)
            self.save()
